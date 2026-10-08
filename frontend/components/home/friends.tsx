import { Link2 } from "lucide-react";
import type { CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import {
  buttonDown,
  printedCami,
  trousers,
  wideLegJeans,
  type Garment,
} from "@/lib/wardrobe";

function ClosetPanel({ owner, outfit }: { owner: string; outfit: [Garment, Garment] }) {
  return (
    <div className="reveal rounded-(--radius-surface) bg-secondary p-5 md:p-7">
      <p className="text-sm font-medium">{owner}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4">
        {outfit.map((garment, i) => (
          <GarmentPrint
            key={garment.name}
            garment={garment}
            sizes="(min-width: 768px) 220px, 42vw"
            className="md:rotate-(--tilt)"
            style={{ "--tilt": i === 0 ? "-2deg" : "1.5deg" } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export function Friends() {
  return (
    <section id="friends" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="reveal type-display text-4xl md:text-6xl">Match outfits with friends.</h2>
        <p className="reveal mx-auto mt-5 max-w-[50ch] text-lg leading-relaxed text-muted-foreground">
          Connect wardrobes for a trip or a party. The app matches outfits
          across both closets, using only what you each own.
        </p>
      </div>

      <div className="mt-14 grid items-center gap-5 md:mt-16 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <ClosetPanel owner="Your closet" outfit={[buttonDown, trousers]} />
        <div className="reveal flex flex-row items-center justify-center gap-3 md:flex-col">
          <span className="flex size-12 items-center justify-center rounded-full bg-pop text-pop-foreground">
            <Link2 aria-hidden="true" className="size-5" strokeWidth={2} />
          </span>
          <p className="text-sm font-medium md:max-w-[9ch] md:text-center">Day trip, Saturday</p>
        </div>
        <ClosetPanel owner="Ishita’s closet" outfit={[printedCami, wideLegJeans]} />
      </div>

      <p className="reveal mx-auto mt-10 max-w-[48ch] text-center text-pretty text-muted-foreground">
        The same two blues, swapped between top and bottom. Nothing new to buy.
      </p>
    </section>
  );
}
