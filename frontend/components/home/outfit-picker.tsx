"use client";

import { ArrowRight, Cloud, Moon, Sun, Wind, type LucideIcon } from "lucide-react";
import { useState, type CSSProperties } from "react";

import { GarmentPrint } from "@/components/home/garment-print";
import {
  buttonDown,
  printedCami,
  trousers,
  wideLegJeans,
  type Garment,
} from "@/lib/wardrobe";

type Plan = {
  id: string;
  prompt: string;
  when: string;
  forecast: string;
  icon: LucideIcon;
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
    icon: Sun,
    top: printedCami,
    bottom: wideLegJeans,
    why: "A light top for the heat, and loose denim so the whole thing stays relaxed.",
  },
  {
    id: "office",
    prompt: "Office, but not too formal",
    when: "Monday",
    forecast: "21°C and overcast",
    icon: Cloud,
    top: buttonDown,
    bottom: trousers,
    why: "The button-down keeps it sharp. Roll the sleeves up once the meetings are done.",
  },
  {
    id: "dinner",
    prompt: "Dinner with friends on Friday",
    when: "Friday night",
    forecast: "19°C and clear",
    icon: Moon,
    top: printedCami,
    bottom: trousers,
    why: "Print on top, plain dark trousers below. A step up from denim without trying too hard.",
  },
  {
    id: "errands",
    prompt: "Errands and coffee, nothing fussy",
    when: "Saturday",
    forecast: "23°C and breezy",
    icon: Wind,
    top: buttonDown,
    bottom: wideLegJeans,
    why: "Blue on blue, sleeves rolled, shirt untucked. Easy to button up if the wind picks up.",
  },
];

export function OutfitPicker() {
  const [planId, setPlanId] = useState(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const WeatherIcon = plan.icon;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <h2 className="reveal type-display text-4xl md:text-6xl">Ask for an outfit.</h2>
        <p className="reveal mt-5 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">
          Pick a plan to see what the app suggests from a sample closet of
          4 pieces.
        </p>

        <fieldset className="mt-8">
          <legend className="sr-only">Choose a plan for the day</legend>
          <div className="flex flex-col gap-2.5">
            {plans.map((p) => (
              <label
                key={p.id}
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-full border border-border bg-card px-5 py-3.5 text-[15px] transition-[background-color,border-color,color,scale] duration-300 ease-soft hover:border-foreground/30 active:scale-[0.99] has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background"
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={p.id === planId}
                  onChange={() => setPlanId(p.id)}
                  className="sr-only"
                />
                <span>“{p.prompt}”</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 -translate-x-1 opacity-0 transition-[opacity,translate] duration-300 ease-soft group-has-checked:translate-x-0 group-has-checked:opacity-100"
                />
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="lg:col-span-7">
        {/* Outer tray + inner card, concentric radii. */}
        <div className="rounded-(--radius-surface) bg-foreground/[0.035] p-2 ring-1 ring-border">
          <div className="rounded-[calc(var(--radius-surface)-0.5rem)] bg-card p-5 shadow-print md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <WeatherIcon aria-hidden="true" className="size-5 text-pop" strokeWidth={1.75} />
                {plan.when}, {plan.forecast}
              </p>
              <p className="text-muted-foreground">From your closet</p>
            </div>

            <p aria-live="polite" className="sr-only">
              {plan.when}: {plan.top.name} with {plan.bottom.name.toLowerCase()}.
            </p>

            {/* Keyed by plan so the prints re-enter on every change. */}
            {/* Capped so the small cutouts are never stretched far past their pixels. */}
            <div key={plan.id} className="mx-auto mt-6 grid max-w-[30rem] grid-cols-2 gap-4 md:gap-6">
              {[plan.top, plan.bottom].map((garment, i) => (
                <GarmentPrint
                  key={garment.name}
                  garment={garment}
                  sizes="(min-width: 1024px) 300px, 42vw"
                  className="animate-swap md:rotate-(--tilt)"
                  style={
                    {
                      "--tilt": i === 0 ? "-2deg" : "2.5deg",
                      "--delay": `${i * 90}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            <p className="mx-auto mt-6 max-w-[30rem] leading-relaxed text-pretty text-muted-foreground">
              {plan.why}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
