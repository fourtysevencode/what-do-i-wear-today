import type { CSSProperties } from "react";

import { PrimaryCta, SecondaryCta } from "@/components/home/cta";
import { GarmentPrint } from "@/components/home/garment-print";
import { cn } from "@/lib/utils";
import {
  buttonDown,
  printedCami,
  trousers,
  wideLegJeans,
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

// Collage coordinates for md and up, as % of the board. Below md the
// prints fall back to a plain 2x2 grid with no tilt or overlap.
const placements: Placement[] = [
  { garment: buttonDown, left: "1%", top: "2%", width: "48%", tilt: "-4deg", layer: "z-30" },
  { garment: trousers, left: "57%", top: "9%", width: "38%", tilt: "3.5deg", layer: "z-10" },
  { garment: printedCami, left: "9%", top: "57%", width: "31%", tilt: "5deg", layer: "z-20" },
  { garment: wideLegJeans, left: "54%", top: "56%", width: "33%", tilt: "-3deg", layer: "z-20" },
];

function HeroCollage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "isolate grid w-full grid-cols-2 gap-3 md:relative md:mx-auto md:block md:aspect-10/11 md:max-w-[560px] lg:mr-0",
        className,
      )}
    >
      {placements.map(({ garment, left, top, width, tilt, layer }, i) => (
        <GarmentPrint
          key={garment.name}
          garment={garment}
          eager
          sizes="(min-width: 768px) 270px, 45vw"
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
          Photograph the clothes you own. Get a sorted wardrobe and outfits
          picked for the weather and your plans.
        </p>
        <div
          className="animate-rise mt-10 flex flex-wrap items-center gap-3"
          style={{ "--delay": "240ms" } as CSSProperties}
        >
          <PrimaryCta href="#outfit">Build an Outfit</PrimaryCta>
          <SecondaryCta href="#how">How It Works</SecondaryCta>
        </div>
      </div>
      <HeroCollage className="lg:col-span-6" />
    </section>
  );
}
