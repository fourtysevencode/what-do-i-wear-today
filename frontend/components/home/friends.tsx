import { LinkSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import {
  buttonDown,
  printedCami,
  trousers,
  wideLegJeans,
  type Garment,
} from "@/lib/wardrobe";

/** Top and bottom laid out like a flat-lay: overlapping, slightly askew. */
function ClosetPanel({ owner, outfit }: { owner: string; outfit: [Garment, Garment] }) {
  const [top, bottom] = outfit;
  return (
    <div className="reveal rounded-(--radius-surface) bg-secondary p-5 md:p-7">
      <p className="text-sm font-medium">{owner}</p>
      <div className="isolate mt-5 flex items-start">
        <GarmentPrint
          garment={top}
          className="relative z-10 w-[56%] shrink-0 rotate-(--tilt)"
          style={{ "--tilt": "-3deg" } as CSSProperties}
        />
        <GarmentPrint
          garment={bottom}
          className="-ml-[12%] mt-[18%] w-[56%] shrink-0 rotate-(--tilt)"
          style={{ "--tilt": "2.5deg" } as CSSProperties}
        />
      </div>
    </div>
  );
}

export function Friends() {
  return (
    <section
      id="friends"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 pb-24 sm:px-6 md:pt-24 md:pb-32 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="reveal type-display text-4xl md:text-6xl">Match outfits with friends.</h2>
        <p className="reveal mx-auto mt-5 max-w-[50ch] text-lg leading-relaxed text-pretty text-muted-foreground">
          Connect wardrobes for a trip or a party. The app matches outfits
          across both closets, using only what you each own.
        </p>
      </div>

      <div className="mt-14 grid items-center gap-5 md:mt-16 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <ClosetPanel owner="Your closet" outfit={[buttonDown, trousers]} />
        <div className="reveal flex flex-row items-center justify-center gap-3 md:flex-col">
          <span className="flex size-12 items-center justify-center rounded-full bg-pop text-pop-foreground">
            <LinkSimpleIcon aria-hidden="true" className="size-5" weight="bold" />
          </span>
          <p className="text-sm font-medium md:max-w-[9ch] md:text-center">Day trip, Saturday</p>
        </div>
        <ClosetPanel owner="Ishita’s closet" outfit={[printedCami, wideLegJeans]} />
      </div>

      <p className="reveal mx-auto mt-10 max-w-[48ch] text-center text-pretty text-muted-foreground">
        Two outfits that work side by side, from two closets. Nothing new to buy.
      </p>
    </section>
  );
}
