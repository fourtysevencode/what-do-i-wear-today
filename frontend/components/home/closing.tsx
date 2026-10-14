import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Wordmark } from "@/components/home/site-header";
import { ThemeToggle } from "@/components/theme-toggle";

const REPO_URL = "https://github.com/fourtysevencode/what-do-i-wear-today";

/** The last word: an inverted panel, so the page ends on its strongest colour. */
export function Closing() {
  return (
    <section className="px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[calc(var(--radius-surface)*1.5)] bg-primary px-6 py-16 text-primary-foreground md:px-16 md:py-24">
        <h2 className="reveal type-hero">
          What do I wear today?
        </h2>
        <p className="reveal mt-6 max-w-[40ch] text-lg leading-relaxed text-pretty text-primary-foreground/80 md:text-xl">
          Ask the closet you already have. Your wardrobe, outfits for the weather, and matching looks with friends.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href="/signup"
            className="group inline-flex h-13 items-center gap-3 rounded-full bg-primary-foreground pr-1.5 pl-6 text-base font-medium whitespace-nowrap text-primary select-none [transition:background-color_200ms_var(--ease-out),scale_150ms_var(--ease-out)] hover:bg-primary-foreground/90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:outline-none"
          >
            Start Your Wardrobe
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-primary/10 transition-[translate] duration-200 ease-out group-hover:translate-x-0.5"
            >
              <ArrowRightIcon className="size-4" weight="bold" />
            </span>
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full text-base font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
          >
            View on GitHub
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

const footerLink =
  "rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <Wordmark className="text-foreground" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          <Link href="/#how" className={footerLink}>
            How It Works
          </Link>
          <Link href="/#friends" className={footerLink}>
            With Friends
          </Link>
          <Link href="/status" className={footerLink}>
            API Status
          </Link>
          <Link href="/privacy" className={footerLink}>
            Privacy
          </Link>
          <Link href="/terms" className={footerLink}>
            Terms
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </footer>
  );
}
