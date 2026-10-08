import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Wordmark } from "@/components/home/site-header";
import { getCurrentUser } from "@/lib/dal";

/** Already signed in? Skip the form. Reads the session, so it streams in behind Suspense. */
async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/wardrobe");
  return null;
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <Wordmark />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-24 sm:pt-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </div>
  );
}
