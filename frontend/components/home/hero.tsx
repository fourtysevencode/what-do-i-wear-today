import type { CSSProperties } from "react";

import { PrimaryCta, TextCta } from "@/components/home/cta";
import { GarmentPrint } from "@/components/home/garment-print";
import { cn } from "@/lib/utils";
import {
  buttonDown,
  floralBlouse,
  trousers,
  darkJeans,
  type Garment,
} from "@/lib/wardrobe";

type Placement = {
  garment: Garment;
  left: string;
  top: string;
  width: string;
  tilt: string;
  layer: string;
};

// Collage coordinates for md and up, as % of the board: two columns of equal prints,
// the right one dropped a little, with a small gap so nothing overlaps. Below md the
// prints fall back to a plain 2x2 grid with no tilt.
const placements: Placement[] = [
  { garment: buttonDown, left: "3%", top: "1%", width: "43%", tilt: "-3deg", layer: "z-20" },
  { garment: trousers, left: "54%", top: "8%", width: "43%", tilt: "2.5deg", layer: "z-10" },
  { garment: darkJeans, left: "3%", top: "51%", width: "43%", tilt: "2deg", layer: "z-20" },
  { garment: floralBlouse, left: "54%", top: "58%", width: "43%", tilt: "-2.5deg", layer: "z-10" },
];

function HeroCollage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "isolate grid w-full grid-cols-2 gap-3 md:relative md:mx-auto md:block md:aspect-[10/13] md:max-w-[520px] lg:mr-0",
        className,
      )}
    >
      {placements.map(({ garment, left, top, width, tilt, layer }, i) => (
        <GarmentPrint
          key={garment.name}
          garment={garment}
          eager
          className={cn(
            "animate-print transition-[rotate,translate] duration-500 ease-spring hover:z-40 hover:-translate-y-1.5 md:absolute md:top-(--top) md:left-(--left) md:w-(--width) md:rotate-(--tilt) md:hover:rotate-0",
            layer,
          )}
          style={
            {
              "--left": left,
              "--top": top,
              "--width": width,
              "--tilt": tilt,
              "--delay": `${160 + i * 110}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-10 pb-20 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-28"
    >
      <div className="lg:col-span-6">
        <h1 className="animate-rise type-display text-5xl sm:text-6xl xl:text-[5.25rem]">
          Wear what you <span className="text-pop">already</span> own.
        </h1>
        <p
          className="animate-rise mt-6 max-w-[34ch] text-lg leading-relaxed text-muted-foreground md:text-xl"
          style={{ "--delay": "120ms" } as CSSProperties}
        >
          Snap the clothes you own. An AI stylist builds outfits from them for
          the weather and your plans.
        </p>
        <div
          className="animate-rise mt-10 flex flex-wrap items-center gap-3"
          style={{ "--delay": "240ms" } as CSSProperties}
        >
          <PrimaryCta href="/signup">Sign Up</PrimaryCta>
          <TextCta href="#how">How It Works</TextCta>
        </div>
      </div>
      <HeroCollage className="lg:col-span-6" />
    </section>
  );
}
