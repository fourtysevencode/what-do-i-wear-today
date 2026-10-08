import type { Metadata } from "next";
import { Suspense } from "react";

import { OutfitStudio } from "@/components/app/outfit-studio";
import { StylingSkeleton } from "@/components/app/studio-parts";

export const metadata: Metadata = { title: "Build an outfit · What do I wear today?" };

export default function NewOutfitPage() {
  return (
    <div>
      <h1 className="type-display text-4xl md:text-5xl">Build an outfit</h1>
      <p className="mt-2 mb-8 text-pretty text-muted-foreground">
        The stylist picks from your wardrobe, with the weather and the occasion in mind.
      </p>
      {/* Reads the URL (notes and weather carried over from the wardrobe page). */}
      <Suspense fallback={<StylingSkeleton />}>
        <OutfitStudio />
      </Suspense>
    </div>
  );
}
