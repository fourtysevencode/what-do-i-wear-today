import { TShirtIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AddClothing } from "@/components/app/add-clothing";
import { OutfitBuilder } from "@/components/app/outfit-builder";
import { WardrobeGrid, WardrobeGridSkeleton } from "@/components/app/wardrobe-grid";
import { requireUser } from "@/lib/dal";
import { listGarments } from "@/lib/garments";

export const metadata: Metadata = { title: "Wardrobe · What do I wear today?" };

function EmptyWardrobe() {
  return (
    <div className="flex flex-col items-center rounded-(--radius-surface) border border-dashed border-foreground/15 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-orchid text-swatch-ink">
        <TShirtIcon aria-hidden="true" className="size-7" />
      </span>
      <h2 className="mt-5 font-heading text-xl font-semibold tracking-tight">Add your first piece</h2>
      <p className="mt-2 max-w-[38ch] text-pretty text-muted-foreground">
        Take a mirror photo and choose Add Clothing. Each garment is cut out, labelled and saved here.
      </p>
    </div>
  );
}

async function MyWardrobe() {
  const user = await requireUser();
  const garments = await listGarments(user.id);
  return <WardrobeGrid garments={garments} empty={<EmptyWardrobe />} removable />;
}

export default function WardrobePage() {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
      <section aria-labelledby="wardrobe-title" className="min-w-0">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 id="wardrobe-title" className="type-display text-4xl md:text-5xl">
              Your wardrobe
            </h1>
            <p className="mt-2 text-muted-foreground">Everything you own, cut out and sorted.</p>
          </div>
          <AddClothing />
        </div>
        <Suspense fallback={<WardrobeGridSkeleton />}>
          <MyWardrobe />
        </Suspense>
      </section>

      <aside aria-label="Outfit builder" className="xl:sticky xl:top-10 xl:self-start">
        <OutfitBuilder />
      </aside>
    </div>
  );
}
