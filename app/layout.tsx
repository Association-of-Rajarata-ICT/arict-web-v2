import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics";
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
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-svh flex-col">
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
