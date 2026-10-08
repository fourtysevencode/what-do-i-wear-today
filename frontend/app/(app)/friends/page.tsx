import { ArrowRightIcon, CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { respondToFriendRequest } from "@/app/(app)/friends/actions";
import { AddFriendForm } from "@/components/app/add-friend-form";
import { SubmitButton } from "@/components/app/submit-button";
import { buttonSmall } from "@/components/app/styles";
import { requireUser } from "@/lib/dal";
import { listConnections, type Person } from "@/lib/friends";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Friends · What do I wear today?" };

// A palette tile per person, picked from their username so it stays stable.
const tiles = ["bg-orchid", "bg-peach", "bg-rose"];
function Monogram({ username }: { username: string }) {
  const tile = tiles[[...username].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % tiles.length];
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl font-heading font-semibold text-swatch-ink uppercase", tile)}
    >
      {username.charAt(0)}
    </span>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${title}-title`.replace(/\s+/g, "-")} className="flex flex-col gap-3">
      <h2 id={`${title}-title`.replace(/\s+/g, "-")} className="font-heading text-lg font-semibold tracking-tight">
        {title} <span className="font-sans text-sm font-normal text-muted-foreground tabular-nums">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function RequestRow({ person }: { person: Person }) {
  return (
    <li className="flex items-center gap-3 rounded-(--radius-print) bg-card p-3 ring-1 ring-border">
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
          className={cn(buttonSmall, "bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          Accept
        </SubmitButton>
        <SubmitButton
          name="decision"
          value="decline"
          icon={<XIcon aria-hidden="true" className="size-4" />}
          pendingLabel="Declining…"
          className={cn(buttonSmall, "border border-foreground/15 hover:bg-foreground/5")}
        >
          Decline
        </SubmitButton>
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
          <p className="rounded-(--radius-print) border border-dashed border-foreground/15 px-5 py-8 text-center text-pretty text-muted-foreground">
            No friends yet. Send a request above, and once they accept you can see each other&apos;s wardrobes.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {friends.map((friend) => (
              <li key={friend.id}>
                <Link
                  href={`/friends/${friend.username}`}
                  className="group flex items-center gap-3 rounded-(--radius-print) bg-card p-3 ring-1 ring-border transition-[box-shadow,background-color] hover:bg-secondary/60 hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Monogram username={friend.username} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium" translate="no">
                      @{friend.username}
                    </span>
                    <span className="block text-sm text-muted-foreground">View wardrobe</span>
                  </span>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform duration-300 ease-soft group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {outgoing.length > 0 && (
        <Section title="Sent" count={outgoing.length}>
          <ul className="flex flex-col gap-2">
            {outgoing.map((person) => (
              <li key={person.id} className="flex items-center gap-3 px-1">
                <Monogram username={person.username} />
                <p className="min-w-0 flex-1 truncate" translate="no">
                  @{person.username}
                </p>
                <span className="text-sm text-muted-foreground">Waiting for them to accept</span>
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
      <div className="h-6 w-32 rounded-full bg-muted" />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="h-16 rounded-(--radius-print) bg-muted" />
        <div className="h-16 rounded-(--radius-print) bg-muted" />
      </div>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="type-display text-4xl md:text-5xl">Friends</h1>
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
  );
}
