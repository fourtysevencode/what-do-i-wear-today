import Link from "next/link";

import { SectionNav } from "@/components/home/section-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      translate="no"
      className={cn(
        "font-display text-[1.1875rem] font-[560] tracking-[-0.01em] whitespace-nowrap [font-variation-settings:'SOFT'_30]",
        className,
      )}
    >
      what do i wear today
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="glass scroll-edge-b sticky top-0 z-40 pt-[env(safe-area-inset-top)] [view-transition-name:site-header]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/#top"
          aria-label="What do I wear today, back to top"
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          <SectionNav />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-1 text-foreground")}>
            Log In
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
