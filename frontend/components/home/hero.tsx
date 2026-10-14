import { HandGrabbingIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { PrimaryCta, TextCta } from "@/components/home/cta";
import { Pinboard } from "@/components/home/pinboard";
import { buttonDown, darkJeans, floralBlouse, trousers } from "@/lib/wardrobe";

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-10 pb-20 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-28"
    >
      <div className="lg:col-span-6">
        <p className="animate-rise type-eyebrow text-thread-text">Your closet, styled</p>
        <h1 className="animate-rise type-hero mt-5" style={{ "--delay": "60ms" } as CSSProperties}>
          Wear what you already own.
        </h1>
        <p
          className="animate-rise mt-7 max-w-[34ch] text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl"
          style={{ "--delay": "140ms" } as CSSProperties}
        >
          Snap the clothes you own. An AI stylist builds outfits from them for the weather and your plans.
        </p>
        <div className="animate-rise mt-10 flex flex-wrap items-center gap-3" style={{ "--delay": "220ms" } as CSSProperties}>
          <PrimaryCta href="/signup">Start Your Wardrobe</PrimaryCta>
          <TextCta href="#how">How It Works</TextCta>
        </div>
      </div>
      <div className="lg:col-span-6">
        <Pinboard garments={[buttonDown, trousers, darkJeans, floralBlouse]} />
        <p className="mx-auto mt-6 hidden max-w-[520px] items-center justify-center gap-2 text-sm text-muted-foreground md:flex lg:mr-0">
          <HandGrabbingIcon aria-hidden="true" className="size-4" />
          Go on, pick one up. Throw it at another slot to swap them.
        </p>
      </div>
    </section>
  );
}
