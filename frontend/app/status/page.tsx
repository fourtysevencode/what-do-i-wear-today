import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { SiteFooter } from "@/components/home/closing";
import { SiteHeader } from "@/components/home/site-header";
import { RecheckButton } from "@/components/status/recheck-button";
import { API_URL, formatUptime, getHealth, type HealthResult } from "@/lib/api";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "API status · What do I wear today?",
  description: "Live health of the outfit segmentation API.",
};

function describe(result: HealthResult) {
  if (result.ok) return { label: "Up and running", tone: "up" as const };
  if (result.reason === "timeout")
    return {
      label: "Waking up",
      tone: "waiting" as const,
      hint: "The free Space sleeps when idle. It usually answers within a minute; check again shortly.",
    };
  if (result.reason === "http")
    return {
      label: `Responded with ${result.httpStatus}`,
      tone: "down" as const,
      hint: "The server is reachable but returned an error. Check the Space logs on Hugging Face.",
    };
  return {
    label: "Unreachable",
    tone: "down" as const,
    hint: "The request didn't reach the server. The Space may be stopped or still building.",
  };
}

const toneDot = {
  up: "bg-pop",
  waiting: "bg-peach",
  down: "bg-destructive",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-(--radius-surface) bg-foreground/[0.035] p-2 ring-1 ring-border">
      <div className="rounded-[calc(var(--radius-surface)-0.5rem)] bg-card p-6 shadow-print md:p-8">
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 truncate text-lg font-medium tabular-nums",
          mono && "font-mono text-base",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

async function HealthPanel() {
  await connection();
  const result = await getHealth();
  const { label, tone, hint } = { hint: undefined, ...describe(result) };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-3 text-2xl font-semibold tracking-tight" role="status">
          {/* Real state indicator, not decoration. */}
          <span aria-hidden="true" className={cn("size-3 rounded-full", toneDot[tone])} />
          {label}
        </p>
        <RecheckButton />
      </div>

      {hint && <p className="mt-3 max-w-[56ch] text-pretty text-muted-foreground">{hint}</p>}

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-6 md:grid-cols-3">
        <Stat label="Response time" value={`${result.latencyMs.toLocaleString("en")} ms`} />
        <Stat label="Uptime" value={result.ok ? formatUptime(result.data.uptime) : "Unknown"} />
        <Stat label="Version" value={result.ok ? result.data.version : "Unknown"} />
      </dl>

      {result.ok && (
        <figure className="mt-8 rounded-(--radius-print) bg-secondary px-5 py-4">
          <blockquote className="text-lg">“{result.data.message}”</blockquote>
          <figcaption className="mt-1 text-sm text-muted-foreground">Message from the server</figcaption>
        </figure>
      )}
    </Card>
  );
}

function HealthSkeleton() {
  return (
    <Card>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="flex items-center justify-between gap-4">
          <div className="h-8 w-56 rounded-full bg-muted" />
          <div className="h-11 w-36 rounded-full bg-muted" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 rounded-full bg-muted" />
              <div className="mt-2 h-6 w-20 rounded-full bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-8 h-20 rounded-(--radius-print) bg-muted" />
      </div>
      <p className="sr-only" role="status">
        Checking the API…
      </p>
    </Card>
  );
}

export default function StatusPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 md:pt-20 md:pb-32">
        <h1 className="type-display text-5xl md:text-6xl">API status</h1>
        <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-pretty text-muted-foreground">
          Live health of the segmentation API that finds and cuts out each garment.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Endpoint{" "}
          <a
            href={`${API_URL}/health`}
            target="_blank"
            rel="noopener noreferrer"
            translate="no"
            className="rounded-sm font-mono break-all text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-pop focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {API_URL.replace("https://", "")}/health
          </a>
        </p>

        <div className="mt-10">
          <Suspense fallback={<HealthSkeleton />}>
            <HealthPanel />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
