import { ArrowLeftIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { buttonPrimary } from "@/components/app/styles";
import { WardrobeGrid, WardrobeGridSkeleton } from "@/components/app/wardrobe-grid";
import { requireUser } from "@/lib/dal";
import { findFriend } from "@/lib/friends";
import { listGarments } from "@/lib/garments";

export const metadata: Metadata = { title: "Friend's wardrobe · What do I wear today?" };

/** Only accepted friends get past this; everyone else sees a not-found page. */
async function FriendWardrobe({ params }: { params: PageProps<"/friends/[username]">["params"] }) {
  const { username } = await params;
  const user = await requireUser();
  const friend = await findFriend(user.id, decodeURIComponent(username));
  if (!friend) notFound();

  const garments = await listGarments(friend.id);
  return (
    <>
      <h1 className="type-display text-4xl md:text-5xl">
        <span translate="no">@{friend.username}</span>&apos;s wardrobe
      </h1>
      <div className="mt-2 mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {garments.length} {garments.length === 1 ? "piece" : "pieces"}
        </p>
        <Link href={`/outfits/match?friend=${encodeURIComponent(friend.username)}`} className={buttonPrimary}>
          <SparkleIcon aria-hidden="true" className="size-4" weight="fill" />
          Build Matching Outfits
        </Link>
      </div>
      <WardrobeGrid
        garments={garments}
        empty={
          <p className="rounded-(--radius-surface) border border-dashed border-foreground/15 px-6 py-16 text-center text-muted-foreground">
            <span translate="no">@{friend.username}</span> hasn&apos;t added any clothes yet.
          </p>
        }
      />
    </>
  );
}

export default function FriendWardrobePage({ params }: PageProps<"/friends/[username]">) {
  return (
    <div>
      <Link
        href="/friends"
        className="mb-6 inline-flex items-center gap-1.5 rounded-full text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Friends
      </Link>
      <Suspense
        fallback={
          <>
            <div className="h-12 w-72 max-w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="mt-3 mb-8 h-5 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <WardrobeGridSkeleton />
          </>
        }
      >
        <FriendWardrobe params={params} />
      </Suspense>
    </div>
  );
}
