"use client";

import { CloudIcon, MoonIcon, SunIcon, WindIcon } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { startTransition, useState, ViewTransition, type CSSProperties } from "react";

import { OutfitViewArea, OutfitViewToggle } from "@/components/app/outfit-view-mode";
import { GarmentPrint } from "@/components/home/garment-print";
import { buttonDown, darkJeans, floralBlouse, trousers, type Garment } from "@/lib/wardrobe";

type Plan = {
  id: string;
  prompt: string;
  when: string;
  forecast: string;
  icon: Icon;
  top: Garment;
  bottom: Garment;
  why: string;
};

// Sample suggestions for the demo closet. Forecasts are illustrative.
const plans: Plan[] = [
  {
    id: "casual",
    prompt: "Something casual for tomorrow",
    when: "Tomorrow",
    forecast: "27°C and sunny",
    icon: SunIcon,
    top: floralBlouse,
    bottom: darkJeans,
    why: "A light, airy blouse for the heat, and dark denim so the whole thing stays relaxed.",
  },
  {
    id: "office",
    prompt: "Office, but not too formal",
    when: "Monday",
    forecast: "21°C and overcast",
    icon: CloudIcon,
    top: buttonDown,
    bottom: trousers,
    why: "The button-down keeps it sharp. Roll the sleeves up once the meetings are done.",
  },
  {
    id: "dinner",
    prompt: "Dinner with friends on Friday",
    when: "Friday night",
    forecast: "19°C and clear",
    icon: MoonIcon,
    top: floralBlouse,
    bottom: trousers,
    why: "Print on top, dark trousers below. A step up from denim without trying too hard.",
  },
  {
    id: "errands",
    prompt: "Errands and coffee, nothing fussy",
    when: "Saturday",
    forecast: "23°C and breezy",
    icon: WindIcon,
    top: buttonDown,
    bottom: darkJeans,
    why: "White shirt, dark denim, sleeves rolled. Easy to button up if the wind picks up.",
  },
];

export function OutfitPicker() {
  const [planId, setPlanId] = useState(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const WeatherIcon = plan.icon;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-5">
        <p className="reveal type-eyebrow text-thread-text">Try it</p>
        <h2 className="reveal type-display mt-4">
          Ask for an outfit.
        </h2>
        <p className="reveal mt-5 max-w-[44ch] text-lg leading-relaxed text-pretty text-muted-foreground">
          Pick a plan to see the stylist&apos;s choice from a sample closet of 4 pieces. View it as a grid or as worn.
        </p>

        {/* A swipeable chip row on phones (right above the result it changes), a list beside it on desktop. */}
        <fieldset className="mt-8">
          <legend className="sr-only">Choose a plan for the day</legend>
          <div className="-mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {plans.map((p) => (
              <label
                key={p.id}
                className="flex shrink-0 cursor-pointer snap-start items-center gap-3 rounded-full bg-card px-5 py-3 text-[0.9375rem] whitespace-nowrap ring-1 ring-border ring-inset select-none transition-[background-color,color,scale] duration-150 hover:bg-secondary active:scale-[0.98] has-checked:bg-primary has-checked:text-primary-foreground has-checked:ring-transparent has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background lg:py-3.5 lg:whitespace-normal"
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={p.id === planId}
                  // A transition lets the outfit cross-fade instead of popping.
                  onChange={() => startTransition(() => setPlanId(p.id))}
                  className="sr-only"
                />
                <p.icon aria-hidden="true" className="size-4 shrink-0 opacity-70" />
                <span>“{p.prompt}”</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="min-w-0 lg:col-span-7">
        {/* Outer tray + inner card, concentric radii. */}
        <div className="rounded-[calc(var(--radius-surface)+0.5rem)] bg-secondary p-2">
          <OutfitViewArea className="rounded-(--radius-surface) bg-card p-5 shadow-card md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <WeatherIcon aria-hidden="true" className="size-5 text-thread" weight="duotone" />
                {plan.when}, {plan.forecast}
              </p>
              <OutfitViewToggle />
            </div>

            <p aria-live="polite" className="sr-only">
              {plan.when}: {plan.top.name} with {plan.bottom.name.toLowerCase()}.
            </p>

            <ViewTransition key={plan.id} enter="swap" exit="swap" default="none">
              <div>
                {/* Grid by default; "Stacked" shows top above bottom, the way it's worn. */}
                <div className="mx-auto mt-6 grid max-w-[30rem] grid-cols-2 gap-4 group-data-[view=stacked]/view:max-w-[15rem] group-data-[view=stacked]/view:grid-cols-1 group-data-[view=stacked]/view:gap-4 md:gap-6">
                  {[plan.top, plan.bottom].map((garment, i) => (
                    <GarmentPrint
                      key={garment.name}
                      garment={garment}
                      className="md:rotate-(--tilt)"
                      style={{ "--tilt": i === 0 ? "-2deg" : "2.5deg" } as CSSProperties}
                    />
                  ))}
                </div>
                <p className="mx-auto mt-6 max-w-[30rem] leading-relaxed text-pretty text-muted-foreground">{plan.why}</p>
              </div>
            </ViewTransition>
          </OutfitViewArea>
        </div>
      </div>
    </div>
  );
}
