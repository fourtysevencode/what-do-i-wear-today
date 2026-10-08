export function Wordmark() {
  return (
    <span translate="no" className="font-heading text-[17px] font-semibold tracking-tight">
      what do i wear <span className="text-pop">today</span>
    </span>
  );
}

const navLink =
  "hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline-flex";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label="What do I wear today, back to top"
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Wordmark />
        </a>
        <nav aria-label="Primary" className="flex items-center gap-1">
          <a href="#how" className={navLink}>
            How It Works
          </a>
          <a href="#friends" className={navLink}>
            With Friends
          </a>
          <a
            href="#outfit"
            className="ml-2 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-foreground transition-[background-color,scale] duration-300 ease-soft hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.98]"
          >
            Build an Outfit
          </a>
        </nav>
      </div>
    </header>
  );
}
