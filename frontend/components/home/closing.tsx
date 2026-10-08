import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { PrimaryCta } from "@/components/home/cta";
import { Wordmark } from "@/components/home/site-header";
import { ThemeToggle } from "@/components/theme-toggle";

const REPO_URL = "https://github.com/fourtysevencode/what-do-i-wear-today";

export function Closing() {
  return (
    <section className="px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-(--radius-surface) bg-card px-6 py-16 ring-1 ring-border md:px-16 md:py-24">
        <h2 className="reveal type-display text-5xl sm:text-7xl lg:text-8xl">
          What do I wear <span className="text-pop">today?</span>
        </h2>
        <p className="reveal mt-6 max-w-[40ch] text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
          Ask the closet you already have. Your wardrobe, outfits for the
          weather, and matching looks with friends.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <PrimaryCta href="/signup">Sign Up</PrimaryCta>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            View on GitHub
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <Wordmark />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/#how" className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            How It Works
          </Link>
          <Link href="/#friends" className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            With Friends
          </Link>
          <Link href="/status" className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            API Status
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </footer>
  );
}
