import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/app/(app)/actions";
import { AppNav, AppNavFallback } from "@/components/app/app-nav";
import { Wordmark } from "@/components/home/site-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/dal";

/** Reads the session, so it streams in behind its own boundary and never holds the page. */
async function UserHandle() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <p className="truncate text-sm text-muted-foreground" translate="no">
      @{user.username}
    </p>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md lg:h-dvh lg:border-r lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="flex h-full items-center gap-2 px-4 py-3 sm:px-6 lg:flex-col lg:items-stretch lg:gap-8 lg:px-4 lg:py-6">
          <Link
            href="/"
            className="mr-auto rounded-md px-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:mr-0 lg:px-4"
          >
            <Wordmark />
          </Link>

          <nav aria-label="App" className="flex gap-1 lg:flex-col">
            <Suspense fallback={<AppNavFallback />}>
              <AppNav />
            </Suspense>
          </nav>

          <div className="flex items-center gap-2 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-3 lg:px-4">
            <ThemeToggle className="hidden self-start lg:inline-flex" />
            <div className="hidden lg:block">
              <Suspense fallback={<p className="h-5 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />}>
                <UserHandle />
              </Suspense>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:-ml-3"
              >
                <SignOutIcon aria-hidden="true" className="size-5" />
                <span className="sr-only sm:not-sr-only">Log Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
