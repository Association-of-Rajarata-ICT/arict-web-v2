import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { SITE, SITE_URL } from "@/lib/site";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import "./globals.css";

// Primary (display) font: headings, numbers, wordmarks.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Secondary (text) font: body copy, UI, forms.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE.name,
  title: {
    default: `${SITE.name} — ${SITE.fullName}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: SITE.locale,
    url: `${SITE_URL}/`,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE.fullName }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  colorScheme: "light dark",
};

/**
 * Applies the saved theme (or the system preference) before the first paint,
 * so pages stay statically rendered without a flash of the wrong theme.
 * Also follows system changes while the visitor hasn't chosen a theme.
 */
const THEME_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}",d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");function a(t){d.setAttribute("data-theme",t)}var s=localStorage.getItem(k);a(s==="dark"||s==="light"?s:m.matches?"dark":"light");m.addEventListener("change",function(e){var c=localStorage.getItem(k);if(c!=="dark"&&c!=="light")a(e.matches?"dark":"light")})}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${manrope.variable} ${inter.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-svh flex-col">
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
