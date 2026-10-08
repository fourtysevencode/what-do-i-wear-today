import { CloudSun } from "lucide-react";
import type { CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import { buttonDown, trousers, wardrobe } from "@/lib/wardrobe";

export function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28 lg:px-8"
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
          <p className="mt-3 max-w-[40ch] leading-relaxed text-muted-foreground">
            The model finds each garment in your photo, lifts it off the
            background and names it.
          </p>
          <div className="mx-auto mt-10 grid max-w-[30rem] grid-cols-2 gap-5 md:gap-8">
            {[buttonDown, trousers].map((garment, i) => (
              <div key={garment.name} className={i === 1 ? "md:mt-12" : undefined}>
                <GarmentPrint
                  garment={garment}
                  showCaption={false}
                  sizes="(min-width: 768px) 300px, 42vw"
                  className="md:rotate-(--tilt)"
                  style={{ "--tilt": i === 0 ? "-1.5deg" : "2deg" } as CSSProperties}
                />
                <p className="mt-4 text-center">
                  <span className="sr-only">Detected as </span>
                  <code translate="no" className="rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
                    {garment.detectedAs}
                  </code>
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="reveal rounded-(--radius-surface) bg-card p-6 ring-1 ring-border md:col-span-5 md:p-8">
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            One rack for everything
          </h3>
          <p className="mt-3 max-w-[42ch] leading-relaxed text-muted-foreground">
            Tops and bottoms sit together on one screen, so nothing gets
            forgotten at the back of the cupboard.
          </p>
          <ul className="mt-8 grid grid-cols-4 gap-2.5" aria-label="Your wardrobe">
            {wardrobe.map((garment) => (
              <li key={garment.name}>
                <GarmentPrint
                  garment={garment}
                  showCaption={false}
                  sizes="120px"
                  className="rounded-[0.75rem] p-1 shadow-none ring-1 ring-border"
                />
              </li>
            ))}
          </ul>
        </article>

        <article className="reveal flex flex-col justify-between gap-10 rounded-(--radius-surface) bg-pop p-6 text-pop-foreground md:col-span-5 md:p-8">
          <CloudSun aria-hidden="true" className="size-10" strokeWidth={1.5} />
          <div>
            <h3 className="font-heading text-2xl font-semibold tracking-tight">
              Planned around your day
            </h3>
            <p className="mt-3 max-w-[40ch] leading-relaxed">
              Suggestions check the forecast and where you are headed, from
              interviews to beach days.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
