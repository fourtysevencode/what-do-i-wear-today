import { Closing, SiteFooter } from "@/components/home/closing";
import { Friends } from "@/components/home/friends";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { OutfitPicker } from "@/components/home/outfit-picker";
import { SiteHeader } from "@/components/home/site-header";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to Content
      </a>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <HowItWorks />
        <section
          id="outfit"
          aria-label="Outfit demo"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 pb-24 sm:px-6 md:pt-24 md:pb-32 lg:px-8"
        >
          <OutfitPicker />
        </section>
        <Friends />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
