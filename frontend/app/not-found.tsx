import { PrimaryCta } from "@/components/home/cta";
import { SiteHeader } from "@/components/home/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col justify-center px-4 pb-24 sm:px-6 lg:px-8">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="type-display mt-4 max-w-[14ch] text-5xl sm:text-7xl">
          This page isn’t in the <span className="text-pop">closet.</span>
        </h1>
        <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-pretty text-muted-foreground">
          The link may be old, or the page was moved. Head back to the homepage
          to find what you were after.
        </p>
        <div className="mt-10">
          <PrimaryCta href="/">Back to Home</PrimaryCta>
        </div>
      </main>
    </>
  );
}
