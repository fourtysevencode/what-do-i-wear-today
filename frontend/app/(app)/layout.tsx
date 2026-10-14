import Link from "next/link";
import { Suspense } from "react";

import { AppNav, AppNavFallback } from "@/components/app/app-nav";
import { CaptureProvider } from "@/components/app/capture-provider";
import { Monogram } from "@/components/app/monogram";
import { SidebarAdd } from "@/components/app/sidebar-add";
import { TabBar } from "@/components/app/tab-bar";
import { Wordmark } from "@/components/home/site-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { SheetStage } from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/dal";

/** Reads the session, so it streams in behind its own boundary and never holds the page. */
async function UserHandle() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <Link
      href="/account"
      className="flex min-w-0 items-center gap-3 rounded-full py-1 pr-3 pl-1 transition-[background-color,scale] duration-150 hover:bg-foreground/6 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Monogram username={user.username} size="sm" />
      <span className="truncate text-sm font-medium" translate="no">
        @{user.username}
      </span>
    </Link>
  );
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <CaptureProvider>
      <SheetStage>
        <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
          {/* Desktop sidebar. Phones get the tab bar below instead. */}
          <aside className="glass sticky top-0 z-30 hidden h-dvh flex-col gap-8 border-r border-border px-4 py-6 [view-transition-name:app-chrome] lg:flex">
            <Link
              href="/"
              className="self-start rounded-md px-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Wordmark />
            </Link>

            <SidebarAdd />

            <nav aria-label="App" className="flex flex-col gap-1">
              <Suspense fallback={<AppNavFallback />}>
                <AppNav />
              </Suspense>
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <ThemeToggle className="self-start" />
              <Suspense fallback={<div className="h-10 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />}>
                <UserHandle />
              </Suspense>
            </div>
          </aside>

          <main
            id="main"
            className="min-w-0 px-4 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-12 lg:pt-12 lg:pb-16"
          >
            {children}
          </main>
        </div>
      </SheetStage>
      <TabBar />
    </CaptureProvider>
  );
}
