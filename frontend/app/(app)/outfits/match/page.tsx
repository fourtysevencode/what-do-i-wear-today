import type { Metadata } from "next";
import { Suspense } from "react";

import { BackLink } from "@/components/app/back-link";
import { MatchStudio } from "@/components/app/match-studio";
import { DirectionalPage } from "@/components/app/page-transition";
import { StylingSkeleton } from "@/components/app/studio-parts";
import { requireUser } from "@/lib/dal";
import { listConnections } from "@/lib/friends";

export const metadata: Metadata = { title: "Match with a friend · What do I wear today?" };

async function MatchWithFriends() {
  const user = await requireUser();
  const { friends } = await listConnections(user.id);
  return <MatchStudio friends={friends.map((friend) => friend.username)} />;
}

export default function MatchPage() {
  return (
    <DirectionalPage>
      <div>
        <BackLink href="/outfits">Outfits</BackLink>
        <h1 className="type-title">Match with a friend</h1>
        <p className="mt-2 mb-8 text-pretty text-muted-foreground">
          Coordinated outfits for the two of you, each from your own wardrobe.
        </p>
        <Suspense fallback={<StylingSkeleton columns={2} />}>
          <MatchWithFriends />
        </Suspense>
      </div>
    </DirectionalPage>
  );
}
