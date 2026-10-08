import { PrimaryCta, SecondaryCta } from "@/components/home/cta";
import { Wordmark } from "@/components/home/site-header";

const REPO_URL = "https://github.com/fourtysevencode/what-do-i-wear-today";

export function Closing() {
  return (
    <section className="px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-(--radius-surface) bg-card px-6 py-16 ring-1 ring-border md:px-16 md:py-24">
        <h2 className="reveal type-display text-5xl sm:text-7xl lg:text-8xl">
          What do I wear <span className="text-pop">today?</span>
        </h2>
        <p className="reveal mt-6 max-w-[40ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
          Ask the closet you already have.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center gap-3">
          <PrimaryCta href="#outfit">Build an Outfit</PrimaryCta>
          <SecondaryCta href={REPO_URL} external>
            View on GitHub
          </SecondaryCta>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <Wordmark />
      <nav aria-label="Footer" className="flex gap-6">
        <a href="#how" className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          How It Works
        </a>
        <a href="#friends" className="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          With Friends
        </a>
      </nav>
    </footer>
  );
}
