import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BackLink } from "@/components/app/back-link";
import { Monogram } from "@/components/app/monogram";
import { DirectionalPage } from "@/components/app/page-transition";
import { WardrobeGrid, WardrobeGridSkeleton } from "@/components/app/wardrobe-grid";
import { buttonVariants } from "@/components/ui/button";
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Monogram username={friend.username} size="lg" />
          <div className="min-w-0">
            <h1 className="type-title truncate">
              <span translate="no">@{friend.username}</span>
            </h1>
            <p className="mt-0.5 text-muted-foreground">
              {garments.length} {garments.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
        <Link
          href={`/outfits/match?friend=${encodeURIComponent(friend.username)}`}
          transitionTypes={["nav-forward"]}
          className={buttonVariants()}
        >
          <SparkleIcon aria-hidden="true" weight="fill" />
          Match Outfits
        </Link>
      </div>
      <div className="mt-8">
        <WardrobeGrid
          garments={garments}
          empty={
            <p className="rounded-(--radius-surface) border border-dashed border-foreground/15 px-6 py-16 text-center text-muted-foreground">
              <span translate="no">@{friend.username}</span> hasn&apos;t added any clothes yet.
            </p>
          }
        />
      </div>
    </>
  );
}

export default function FriendWardrobePage({ params }: PageProps<"/friends/[username]">) {
  return (
    <DirectionalPage>
      <div>
        <BackLink href="/friends">Friends</BackLink>
        <Suspense
          fallback={
            <>
              <div className="flex items-center gap-4">
                <div className="size-16 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                <div className="h-10 w-56 max-w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              </div>
              <div className="mt-8">
                <WardrobeGridSkeleton />
              </div>
            </>
          }
        >
          <FriendWardrobe params={params} />
        </Suspense>
      </div>
    </DirectionalPage>
  );
}
