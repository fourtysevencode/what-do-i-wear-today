import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties, ReactNode } from "react";

import { GarmentPrint, swatchClass } from "@/components/home/garment-print";
import { cn } from "@/lib/utils";
import { buttonDown, trousers, wardrobe } from "@/lib/wardrobe";

type StepProps = { number: string; title: string; children: ReactNode; className?: string; inverted?: boolean };

function Step({ number, title, children, className, inverted = false }: StepProps) {
  return (
    <article className={cn("reveal flex flex-col rounded-(--radius-surface) p-6 md:p-8", className)}>
      <p
        className={cn(
          "font-display text-sm font-medium tracking-[0.04em] tabular-nums",
          inverted ? "text-primary-foreground/75" : "text-thread-text",
        )}
      >
        {number}
      </p>
      <h3 className="type-heading mt-3 md:text-[1.625rem]">{title}</h3>
      {children}
    </article>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 pb-24 sm:px-6 md:pt-24 md:pb-32 lg:px-8">
      <p className="reveal type-eyebrow text-thread-text">How it works</p>
      <h2 className="reveal type-display mt-4 max-w-[16ch]">
        It starts with one mirror photo.
      </h2>

      {/* 3 steps: one tall on the left, two stacked on the right. */}
      <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12 md:grid-rows-2">
        <Step number="01" title="Every piece, cut out" className="bg-secondary md:col-span-7 md:row-span-2 md:p-10">
          <p className="mt-3 max-w-[40ch] leading-relaxed text-pretty text-muted-foreground">
            Take a mirror photo with the camera or upload one. Each garment is found, cut out and named, colours
            included.
          </p>
          <div className="mx-auto mt-10 grid w-full max-w-[30rem] grid-cols-2 gap-5 md:mt-auto md:gap-8 md:pt-10">
            {[buttonDown, trousers].map((garment, i) => (
              <GarmentPrint
                key={garment.name}
                garment={garment}
                className={cn("md:rotate-(--tilt)", i === 1 && "md:mt-12")}
                style={{ "--tilt": i === 0 ? "-1.5deg" : "2deg" } as CSSProperties}
              />
            ))}
          </div>
        </Step>

        <Step number="02" title="One rack for everything" className="min-w-0 bg-card shadow-card ring-1 ring-border md:col-span-5">
          <p className="mt-3 max-w-[42ch] leading-relaxed text-pretty text-muted-foreground">
            Tops and bottoms hang together on one rail, so nothing gets forgotten at the back of the cupboard.
          </p>
          {/* A scroll-snap rail: pieces hang from a rod and slide sideways. */}
          <ul
            aria-label="Your wardrobe"
            tabIndex={0}
            className="-mx-6 mt-8 flex snap-x snap-mandatory overflow-x-auto scroll-px-6 overscroll-x-contain px-6 pb-2 [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:-mx-8 md:scroll-px-8 md:px-8"
          >
            {wardrobe.map((garment) => (
              <li
                key={garment.name}
                className="relative w-[36%] shrink-0 snap-start border-t-2 border-foreground/20 pt-4 pr-3 before:absolute before:top-0 before:left-[calc(50%-0.375rem)] before:h-4 before:w-px before:bg-foreground/30"
              >
                <div className={cn("relative aspect-3/4 overflow-hidden rounded-[0.75rem]", swatchClass[garment.swatch])}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={garment.photo.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                    style={{ objectPosition: garment.photo.position }}
                  />
                </div>
                <p className="mt-2 truncate text-[0.8125rem] font-medium">{garment.name}</p>
              </li>
            ))}
          </ul>
        </Step>

        <Step number="03" title="An AI stylist plans the outfit" inverted className="bg-primary text-primary-foreground md:col-span-5">
          <p className="mt-3 max-w-[40ch] leading-relaxed text-pretty text-primary-foreground/80">
            Tell it where you&apos;re headed. It checks the forecast and picks a look from your wardrobe, from
            interviews to beach days.
          </p>
          <SparkleIcon aria-hidden="true" className="mt-auto size-10 self-end pt-6 text-thread-on-primary" weight="fill" />
        </Step>
      </div>
    </section>
  );
}
