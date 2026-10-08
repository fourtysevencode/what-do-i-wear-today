"use client";

import { ArrowsClockwiseIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import { saveMatchedOutfit } from "@/app/(app)/outfits/actions";
import { OutfitPieces, type Piece } from "@/components/app/outfit-pieces";
import { OutfitViewArea, OutfitViewToggle } from "@/components/app/outfit-view-mode";
import {
  EmptyResult,
  SaveButton,
  StylingSkeleton,
  StylingStatus,
  type SaveState,
} from "@/components/app/studio-parts";
import { Spinner } from "@/components/app/spinner";
import { buttonPrimary, label, surface, textarea } from "@/components/app/styles";
import { WeatherPicker, type WeatherChoice } from "@/components/app/weather-picker";
import { cn } from "@/lib/utils";

type Side = { reasoning: string; items: Piece[] };
type Matched = {
  title: string;
  theme: string;
  weather: string | null;
  you: Side;
  friend: Side & { username: string };
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; result: Matched; notes: string }
  | { kind: "error"; message: string };

function OutfitColumn({ heading, side }: { heading: string; side: Side }) {
  return (
    <section aria-label={heading} className="min-w-0 rounded-(--radius-surface) bg-secondary/60 p-4 md:p-5">
      <h3 className="font-heading text-lg font-semibold tracking-tight" translate="no">
        {heading}
      </h3>
      <p className="mt-1 mb-5 text-sm text-pretty text-muted-foreground">{side.reasoning}</p>
      <OutfitPieces pieces={side.items} compact />
    </section>
  );
}

export function MatchStudio({ friends }: { friends: string[] }) {
  const id = useId();
  const params = useSearchParams();
  const preselected = params.get("friend");
  const [friend, setFriend] = useState(preselected && friends.includes(preselected) ? preselected : friends[0] ?? "");
  const [notes, setNotes] = useState("");
  const [weather, setWeather] = useState<WeatherChoice>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [slow, setSlow] = useState(false);
  const loading = status.kind === "loading";

  if (friends.length === 0) {
    return (
      <EmptyResult>
        Matching needs a friend. Add one on the{" "}
        <Link href="/friends" className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4">
          Friends page
        </Link>
        , and once they accept you can plan outfits together.
      </EmptyResult>
    );
  }

  async function build() {
    setStatus({ kind: "loading" });
    setSave({ kind: "idle" });
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    try {
      const res = await fetch("/api/outfits/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ friend, notes: notes.trim(), weather: weather?.report ?? null }),
      });
      const body = await res.json().catch(() => ({}));
      setStatus(
        res.ok
          ? { kind: "ready", result: body as Matched, notes: notes.trim() }
          : { kind: "error", message: body.error ?? "Something went wrong. Try again." },
      );
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      clearTimeout(slowTimer);
    }
  }

  async function saveOutfits() {
    if (status.kind !== "ready") return;
    setSave({ kind: "saving" });
    const { result } = status;
    const saved = await saveMatchedOutfit({
      title: result.title,
      theme: result.theme,
      notes: status.notes || null,
      weather: result.weather,
      yourIds: result.you.items.map((item) => item.id),
      yourNote: result.you.reasoning,
      friend: result.friend.username,
      friendIds: result.friend.items.map((item) => item.id),
      friendNote: result.friend.reasoning,
    });
    setSave(saved.ok ? { kind: "saved" } : { kind: "error", message: saved.message ?? "Couldn't save them." });
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-12">
      <form
        aria-labelledby={`${id}-form`}
        onSubmit={(event) => {
          event.preventDefault();
          void build();
        }}
        className={`${surface} flex flex-col gap-6 self-start xl:sticky xl:top-10`}
      >
        <h2 id={`${id}-form`} className="font-heading text-xl font-semibold tracking-tight">
          Who&apos;s coming?
        </h2>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${label} mb-2`}>Friend</legend>
          <div className="flex flex-wrap gap-2">
            {friends.map((username) => (
              <label
                key={username}
                className={cn(
                  "flex cursor-pointer items-center rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/30",
                  "has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground",
                  "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
                )}
              >
                <input
                  type="radio"
                  name="friend"
                  value={username}
                  checked={friend === username}
                  onChange={() => setFriend(username)}
                  className="sr-only"
                />
                <span translate="no">@{username}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-notes`} className={label}>
            Event or notes
          </label>
          <textarea
            id={`${id}-notes`}
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="e.g. Beach day, a friend's birthday dinner…"
            className={textarea}
          />
        </div>
        <WeatherPicker onChange={setWeather} />
        <button
          type="submit"
          disabled={loading || !friend}
          aria-busy={loading || undefined}
          className={`${buttonPrimary} h-12 w-full text-[15px]`}
        >
          {loading ? (
            <Spinner />
          ) : status.kind === "ready" ? (
            <ArrowsClockwiseIcon aria-hidden="true" className="size-4" />
          ) : (
            <SparkleIcon aria-hidden="true" className="size-4" weight="fill" />
          )}
          {loading ? "Styling…" : status.kind === "ready" ? "Try Another" : "Build Matching Outfits"}
        </button>
      </form>

      <section aria-label="Matching outfits" aria-busy={loading} className="min-w-0">
        {status.kind === "idle" && (
          <EmptyResult>Pick a friend and describe the plan. You&apos;ll each get an outfit from your own clothes.</EmptyResult>
        )}
        {status.kind === "loading" && (
          <>
            <StylingStatus slow={slow} />
            <StylingSkeleton columns={2} />
          </>
        )}
        {status.kind === "error" && (
          <EmptyResult>
            <span className="text-destructive">{status.message}</span>
          </EmptyResult>
        )}
        {status.kind === "ready" && (
          <OutfitViewArea>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[60ch]">
                <h2 className="type-display text-3xl md:text-4xl">{status.result.title}</h2>
                <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">{status.result.theme}</p>
              </div>
              <OutfitViewToggle />
            </div>
            {/* You on the left, your friend on the right. */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <OutfitColumn heading="You" side={status.result.you} />
              <OutfitColumn heading={`@${status.result.friend.username}`} side={status.result.friend} />
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <SaveButton state={save} onSave={saveOutfits} />
            </div>
          </OutfitViewArea>
        )}
      </section>
    </div>
  );
}
