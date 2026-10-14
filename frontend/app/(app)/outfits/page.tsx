import { CloudSunIcon, PlusIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DeleteOutfit, OutfitCardShell } from "@/components/app/delete-outfit";
import { OutfitPieces } from "@/components/app/outfit-pieces";
import { OutfitViewArea, OutfitViewToggle } from "@/components/app/outfit-view-mode";
import { DirectionalPage } from "@/components/app/page-transition";
import { EmptyResult } from "@/components/app/studio-parts";
import { surface } from "@/components/app/styles";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { listOutfits, type SavedOutfit } from "@/lib/outfits";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Outfits · What do I wear today?" };

// UTC so the server-rendered date doesn't depend on where it was rendered.
const savedOn = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function OutfitCard({ outfit }: { outfit: SavedOutfit }) {
  const friendName = outfit.friend ? `@${outfit.friend.username}` : "A former friend";
  return (
    <article aria-labelledby={`outfit-${outfit.id}`} className={cn(surface, "flex flex-col gap-5")}>
      <header className="flex items-start justify-between gap-3">
        <div className="max-w-[60ch] min-w-0">
          <p className="type-eyebrow text-muted-foreground">
            <time dateTime={outfit.createdAt}>{savedOn.format(new Date(outfit.createdAt))}</time>
            {outfit.isMatch && (
              <>
                {" · with "}
                <span translate="no" className="normal-case">
                  {friendName}
                </span>
              </>
            )}
          </p>
          <h2 id={`outfit-${outfit.id}`} className="type-heading mt-2">
            {outfit.title}
          </h2>
          <p className="mt-2 leading-relaxed text-pretty text-muted-foreground">{outfit.reasoning}</p>
          {(outfit.notes || outfit.weather) && (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {outfit.notes && <li className="rounded-full bg-secondary px-3 py-1.5">{outfit.notes}</li>}
              {outfit.weather && (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                  <CloudSunIcon aria-hidden="true" className="size-3.5" />
                  {outfit.weather.split(":")[0]}
                </li>
              )}
            </ul>
          )}
        </div>
        <DeleteOutfit id={outfit.id} title={outfit.title} />
      </header>

      {outfit.isMatch ? (
        <div className="grid gap-4 md:grid-cols-2">
          <section aria-label="You" className="min-w-0 rounded-(--radius-card) bg-secondary p-4">
            <h3 className="type-heading">You</h3>
            {outfit.yourNote && <p className="mt-1 mb-4 text-sm text-pretty text-muted-foreground">{outfit.yourNote}</p>}
            <OutfitPieces pieces={outfit.you} scope={`${outfit.id}-you`} compact />
          </section>
          <section aria-label={friendName} className="min-w-0 rounded-(--radius-card) bg-secondary p-4">
            <h3 className="type-heading" translate="no">
              {friendName}
            </h3>
            {outfit.friendNote && <p className="mt-1 mb-4 text-sm text-pretty text-muted-foreground">{outfit.friendNote}</p>}
            {outfit.friend ? (
              <OutfitPieces pieces={outfit.friendPieces} scope={`${outfit.id}-friend`} compact />
            ) : (
              <p className="text-sm text-muted-foreground">Their account no longer exists.</p>
            )}
          </section>
        </div>
      ) : (
        <OutfitPieces pieces={outfit.you} scope={outfit.id} />
      )}
    </article>
  );
}

async function SavedOutfits() {
  const user = await requireUser();
  const outfits = await listOutfits(user.id);
  if (outfits.length === 0) {
    return <EmptyResult>No saved outfits yet. Build one, then choose Save Outfit to keep it here.</EmptyResult>;
  }
  return (
    <div className="flex flex-col gap-6">
      {outfits.map((outfit) => (
        <OutfitCardShell key={outfit.id} id={outfit.id}>
          <OutfitCard outfit={outfit} />
        </OutfitCardShell>
      ))}
    </div>
  );
}

function SavedSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none">
      {[0, 1].map((i) => (
        <div key={i} className="h-80 rounded-(--radius-surface) bg-muted" />
      ))}
    </div>
  );
}

export default function OutfitsPage() {
  return (
    <DirectionalPage>
      <div className="max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="type-title">Outfits</h1>
            <p className="mt-1 text-muted-foreground">Looks you&apos;ve saved, newest first.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/outfits/match" transitionTypes={["nav-forward"]} className={buttonVariants({ variant: "secondary" })}>
              <UsersThreeIcon aria-hidden="true" />
              Match with a Friend
            </Link>
            <Link href="/outfits/new" transitionTypes={["nav-forward"]} className={buttonVariants()}>
              <PlusIcon aria-hidden="true" weight="bold" />
              Build Outfit
            </Link>
          </div>
        </div>

        <OutfitViewArea className="mt-8">
          <OutfitViewToggle className="mb-6" />
          <Suspense fallback={<SavedSkeleton />}>
            <SavedOutfits />
          </Suspense>
        </OutfitViewArea>
      </div>
    </DirectionalPage>
  );
}
