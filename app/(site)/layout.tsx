import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/motion/effects";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScrollProvider>
      <a
        href="#main"
        className="fixed top-2 left-2 z-[70] -translate-y-20 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
