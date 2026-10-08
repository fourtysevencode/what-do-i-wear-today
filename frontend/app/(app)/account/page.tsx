import type { Metadata } from "next";
import { Suspense } from "react";

import { UsernameForm } from "@/components/app/username-form";
import { surface } from "@/components/app/styles";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Account · What do I wear today?" };

async function AccountDetails() {
  const user = await requireUser();
  return <UsernameForm current={user.username} />;
}

export default function AccountPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="type-display text-4xl md:text-5xl">Account</h1>
      <p className="mt-2 text-muted-foreground">Your username and how the app looks.</p>
      <section aria-label="Username" className={`${surface} mt-8`}>
        <Suspense
          fallback={
            <div aria-hidden="true" className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
              <div className="h-4 w-20 rounded-full bg-muted" />
              <div className="h-11 max-w-md rounded-full bg-muted" />
              <div className="h-4 w-64 rounded-full bg-muted" />
            </div>
          }
        >
          <AccountDetails />
        </Suspense>
      </section>
      <section aria-labelledby="appearance-title" className={`${surface} mt-4 flex flex-col gap-3`}>
        <h2 id="appearance-title" className="text-sm font-medium">
          Appearance
        </h2>
        <ThemeToggle showLabels className="self-start" />
        <p className="text-sm text-muted-foreground">System follows your device&apos;s light or dark setting.</p>
      </section>
    </div>
  );
}
