"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Suspense } from "react";

import { appSections, useActiveSection } from "@/components/app/app-nav";
import { useCapture } from "@/components/app/capture-provider";
import { Spinner } from "@/components/app/spinner";
import { cn } from "@/lib/utils";

type Section = (typeof appSections)[number];

function Tab({ href, label, icon: SectionIcon, active }: Section & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-medium tracking-[0.01em] transition-[color,scale] duration-150 active:scale-[0.92] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <SectionIcon aria-hidden="true" className="size-6" weight={active ? "fill" : "regular"} />
      {label}
    </Link>
  );
}

function AddButton() {
  const { openCamera, working } = useCapture();
  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={openCamera}
        disabled={working}
        aria-label={working ? "Adding clothing…" : "Add clothing"}
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-[scale,opacity] duration-150 active:scale-[0.9] disabled:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        {working ? <Spinner className="size-5" /> : <PlusIcon aria-hidden="true" className="size-6" weight="bold" />}
      </button>
    </div>
  );
}

function Tabs({ isActive }: { isActive: (href: string) => boolean }) {
  const [first, second, third, fourth] = appSections;
  return (
    <>
      <Tab {...first} active={isActive(first.href)} />
      <Tab {...second} active={isActive(second.href)} />
      <AddButton />
      <Tab {...third} active={isActive(third.href)} />
      <Tab {...fourth} active={isActive(fourth.href)} />
    </>
  );
}

function ActiveTabs() {
  return <Tabs isActive={useActiveSection()} />;
}

/**
 * The phone app bar: four sections with labels, and Add in the middle so a new piece is
 * one tap away from anywhere. Translucent, with content scrolling underneath; padded clear
 * of the home indicator.
 */
export function TabBar() {
  return (
    <nav
      aria-label="App"
      data-tab-bar
      className="glass scroll-edge-t fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[env(safe-area-inset-bottom)] [view-transition-name:app-chrome] lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-stretch px-2 py-1">
        {/* The prerendered shell shows the tabs; the active one fills in on the client. */}
        <Suspense fallback={<Tabs isActive={() => false} />}>
          <ActiveTabs />
        </Suspense>
      </div>
    </nav>
  );
}
