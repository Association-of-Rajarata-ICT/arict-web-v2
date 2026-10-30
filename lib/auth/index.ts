import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users, type UserRole } from "../db/schema";
import { clientKey, rateLimit } from "../rate-limit";

class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = "$2b$12$Mk2C7e4j4TYKE/kqLIhG1.G4lYLyidTMQByeFpTkfS9UyIpG6Ba1G";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = clientKey(request.headers);
        const allowed =
          (await rateLimit(`login:ip:${ip}`, 20, 15 * 60)) &&
          (await rateLimit(`login:email:${email}`, 8, 15 * 60));
        if (!allowed) throw new RateLimitedSignin();

        const [user] = await db
          .select()
          .from(users)
          .where(eq(sql`lower(${users.email})`, email))
          .limit(1);
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid || !user.active) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string | undefined;
        (session.user as { role?: UserRole }).role = token.role as UserRole | undefined;
      }
      return session;
    },
  },
});
