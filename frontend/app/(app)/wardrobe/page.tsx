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
    <div className="flex flex-col items-center rounded-(--radius-surface) border border-dashed border-foreground/15 px-6 py-14 text-center">
      {/* Three blank cards fanned out: the wardrobe waiting to be filled. */}
      <div aria-hidden="true" className="relative h-28 w-40">
        <span className="absolute top-2 left-3 h-24 w-[4.5rem] -rotate-6 rounded-(--radius-card) bg-sage shadow-card" />
        <span className="absolute top-2 right-3 h-24 w-[4.5rem] rotate-6 rounded-(--radius-card) bg-clay shadow-card" />
        <span className="absolute top-0 left-1/2 h-24 w-[4.5rem] -translate-x-1/2 rounded-(--radius-card) bg-chambray shadow-lift" />
      </div>
      <h2 className="type-heading mt-6">Your wardrobe is empty</h2>
      <p className="mt-2 max-w-[36ch] text-pretty text-muted-foreground">
        Take a mirror photo of what you&apos;re wearing. Each garment is found, cut out and saved here.
      </p>
      <AddClothing className="mt-6 justify-center" />
    </div>
  );
}

async function MyWardrobe() {
  const user = await requireUser();
  const garments = await listGarments(user.id);
  return <WardrobeGrid garments={garments} empty={<EmptyWardrobe />} editable />;
}

export default function WardrobePage() {
  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
      <section aria-labelledby="wardrobe-title" className="min-w-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="wardrobe-title" className="type-title">
              Wardrobe
            </h1>
            <p className="mt-1 text-muted-foreground">Everything you own, cut out and sorted. Tap a piece to edit it.</p>
          </div>
          {/* Phones add from the tab bar's centre button, desktops from the sidebar. */}
          <AddClothing className="max-sm:hidden lg:hidden" />
        </div>
        <Suspense fallback={<WardrobeGridSkeleton />}>
          <MyWardrobe />
        </Suspense>
      </section>

      <aside aria-label="Outfit builder" className="xl:sticky xl:top-12 xl:self-start">
        <OutfitBuilder />
      </aside>
    </div>
  );
}
