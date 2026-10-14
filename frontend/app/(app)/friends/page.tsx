import { CaretRightIcon, CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { respondToFriendRequest } from "@/app/(app)/friends/actions";
import { AddFriendForm } from "@/components/app/add-friend-form";
import { Monogram } from "@/components/app/monogram";
import { DirectionalPage } from "@/components/app/page-transition";
import { SubmitButton } from "@/components/app/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { listConnections, type Person } from "@/lib/friends";

export const metadata: Metadata = { title: "Friends · What do I wear today?" };

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const id = `${title}-title`.replace(/\s+/g, "-");
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="type-heading flex items-center gap-2">
        {title}
        <span className="rounded-full bg-secondary px-2 py-0.5 font-sans text-xs font-medium text-muted-foreground tabular-nums">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function RequestRow({ person }: { person: Person }) {
  return (
    <li className="flex items-center gap-3 rounded-(--radius-card) bg-card p-3 shadow-card ring-1 ring-border">
      <Monogram username={person.username} />
      <p className="min-w-0 flex-1 truncate font-medium" translate="no">
        @{person.username}
      </p>
      <form action={respondToFriendRequest} className="flex gap-2">
        <input type="hidden" name="requesterId" value={person.id} />
        <SubmitButton
          name="decision"
          value="accept"
          icon={<CheckIcon aria-hidden="true" className="size-4" weight="bold" />}
          pendingLabel="Accepting…"
          className={buttonVariants({ size: "sm" })}
        >
          Accept
        </SubmitButton>
        <SubmitButton
          name="decision"
          value="decline"
          icon={<XIcon aria-hidden="true" className="size-4" />}
          aria-label={`Decline @${person.username}`}
          className={buttonVariants({ variant: "tinted", size: "icon-sm" })}
        />
      </form>
    </li>
  );
}

async function Connections() {
  const user = await requireUser();
  const { friends, incoming, outgoing } = await listConnections(user.id);

  return (
    <div className="flex flex-col gap-10">
      {incoming.length > 0 && (
        <Section title="Requests" count={incoming.length}>
          <ul className="flex flex-col gap-2">
            {incoming.map((person) => (
              <RequestRow key={person.id} person={person} />
            ))}
          </ul>
        </Section>
      )}

      <Section title="Your friends" count={friends.length}>
        {friends.length === 0 ? (
          <p className="rounded-(--radius-surface) border border-dashed border-foreground/15 px-5 py-10 text-center text-pretty text-muted-foreground">
            No friends yet. Send a request above, and once they accept you can see each other&apos;s wardrobes.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-(--radius-surface) bg-card shadow-card ring-1 ring-border">
            {friends.map((friend) => (
              <li key={friend.id} className="border-b border-border last:border-0">
                <Link
                  href={`/friends/${friend.username}`}
                  transitionTypes={["nav-forward"]}
                  className="group flex items-center gap-3 px-4 py-3 transition-[background-color] hover:bg-secondary active:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <Monogram username={friend.username} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium" translate="no">
                      @{friend.username}
                    </span>
                    <span className="block text-sm text-muted-foreground">View wardrobe</span>
                  </span>
                  <CaretRightIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-[translate] duration-200 group-hover:translate-x-0.5"
                    weight="bold"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {outgoing.length > 0 && (
        <Section title="Sent" count={outgoing.length}>
          <ul className="flex flex-col gap-3">
            {outgoing.map((person) => (
              <li key={person.id} className="flex items-center gap-3 px-1">
                <Monogram username={person.username} size="sm" />
                <p className="min-w-0 flex-1 truncate" translate="no">
                  @{person.username}
                </p>
                <span className="text-sm text-muted-foreground">Waiting for them</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function ConnectionsSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
      <div className="h-5 w-32 rounded-full bg-muted" />
      <div className="h-36 rounded-(--radius-surface) bg-muted" />
    </div>
  );
}

export default function FriendsPage() {
  return (
    <DirectionalPage>
      <div className="max-w-2xl">
        <h1 className="type-title">Friends</h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Friends can see each other&apos;s wardrobes, which helps when you&apos;re planning outfits together.
        </p>
        <div className="mt-8 mb-10">
          <AddFriendForm />
        </div>
        <Suspense fallback={<ConnectionsSkeleton />}>
          <Connections />
        </Suspense>
      </div>
    </DirectionalPage>
  );
}
