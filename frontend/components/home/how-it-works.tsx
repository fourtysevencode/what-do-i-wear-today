import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import { cn } from "@/lib/utils";
import { buttonDown, trousers, wardrobe } from "@/lib/wardrobe";

const rackSwatch = { rose: "bg-rose", peach: "bg-peach", orchid: "bg-orchid" } as const;

export function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 pb-24 sm:px-6 md:pt-24 md:pb-32 lg:px-8"
    >
      <h2 className="reveal type-display max-w-[16ch] text-4xl md:text-6xl">
        It starts with one mirror photo.
      </h2>

      {/* 3 cells: one tall cell on the left, two stacked on the right. */}
      <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12 md:grid-rows-2">
        <article className="reveal rounded-(--radius-surface) bg-secondary p-6 md:col-span-7 md:row-span-2 md:p-10">
          <h3 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Every piece, cut out
          </h3>
          <p className="mt-3 max-w-[40ch] leading-relaxed text-pretty text-muted-foreground">
            Take a mirror photo with the camera or upload one. Each garment is
            found, cut out and named, colours included.
          </p>
          <div className="mx-auto mt-10 grid max-w-[30rem] grid-cols-2 gap-5 md:gap-8">
            {[buttonDown, trousers].map((garment, i) => (
              <GarmentPrint
                key={garment.name}
                garment={garment}
                className={cn("md:rotate-(--tilt)", i === 1 && "md:mt-12")}
                style={{ "--tilt": i === 0 ? "-1.5deg" : "2deg" } as CSSProperties}
              />
            ))}
          </div>
        </article>

        <article className="reveal min-w-0 rounded-(--radius-surface) bg-card p-6 ring-1 ring-border md:col-span-5 md:p-8">
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            One rack for everything
          </h3>
          <p className="mt-3 max-w-[42ch] leading-relaxed text-pretty text-muted-foreground">
            Tops and bottoms hang together on one rail, so nothing gets
            forgotten at the back of the cupboard.
          </p>
          {/* A scroll-snap rail: pieces hang from a rod and slide sideways. */}
          <ul
            aria-label="Your wardrobe"
            tabIndex={0}
            className="-mx-6 mt-8 flex snap-x snap-mandatory overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:-mx-8 md:scroll-px-8 md:px-8"
          >
            {wardrobe.map((garment) => (
              <li
                key={garment.name}
                className="relative w-[36%] shrink-0 snap-start border-t-2 border-foreground/15 pt-4 pr-3 before:absolute before:top-0 before:left-[calc(50%-0.375rem)] before:h-4 before:w-px before:bg-foreground/25"
              >
                <div
                  aria-hidden="true"
                  className={cn("aspect-3/4 rounded-[0.75rem]", rackSwatch[garment.swatch])}
                />
                <p className="mt-2 truncate text-[13px] font-medium">{garment.name}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="reveal flex flex-col justify-between gap-10 rounded-(--radius-surface) bg-rose p-6 text-swatch-ink md:col-span-5 md:p-8">
          <SparkleIcon aria-hidden="true" className="size-10" weight="light" />
          <div>
            <h3 className="font-heading text-2xl font-semibold tracking-tight">
              An AI stylist plans the outfit
            </h3>
            <p className="mt-3 max-w-[40ch] leading-relaxed text-pretty">
              Tell it where you&apos;re headed. It checks the forecast and picks
              a look from your wardrobe, from interviews to beach days.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
