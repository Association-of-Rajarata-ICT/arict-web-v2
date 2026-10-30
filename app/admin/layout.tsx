import type { Metadata } from "next";

// The admin area reads the session on every request, so it is allowed to block
// on the server instead of producing a static shell.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · ARICT Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-svh bg-mist/60">{children}</div>;
}
