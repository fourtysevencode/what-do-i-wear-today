import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";

import { logout } from "@/app/(app)/actions";
import { Monogram } from "@/components/app/monogram";
import { surface } from "@/components/app/styles";
import { SubmitButton } from "@/components/app/submit-button";
import { UsernameForm } from "@/components/app/username-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Account · What do I wear today?" };

async function Profile() {
  const user = await requireUser();
  return (
    <>
      <div className="flex items-center gap-4">
        <Monogram username={user.username} size="lg" />
        <div className="min-w-0">
          <p className="type-heading truncate" translate="no">
            @{user.username}
          </p>
          <p className="text-sm text-muted-foreground">Friends find you by this name.</p>
        </div>
      </div>
      <section aria-label="Username" className={cn(surface, "mt-8")}>
        <UsernameForm current={user.username} />
      </section>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-muted" />
        <div className="h-6 w-40 rounded-full bg-muted" />
      </div>
      <div className="mt-8 h-40 rounded-(--radius-surface) bg-muted" />
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="type-title">Account</h1>
      <div className="mt-8">
        <Suspense fallback={<ProfileSkeleton />}>
          <Profile />
        </Suspense>
      </div>

      <section aria-labelledby="appearance-title" className={cn(surface, "mt-4 flex flex-col gap-3")}>
        <h2 id="appearance-title" className="type-heading">
          Appearance
        </h2>
        <ThemeToggle showLabels className="self-start" />
        <p className="text-sm text-muted-foreground">System follows your device&apos;s light or dark setting.</p>
      </section>

      {/* Log out lives here, away from the section tabs, so it's never a stray tap. */}
      <form action={logout} className="mt-10">
        <SubmitButton
          icon={<SignOutIcon aria-hidden="true" className="size-4" />}
          pendingLabel="Logging out…"
          className={cn(buttonVariants({ variant: "secondary" }), "text-destructive")}
        >
          Log Out
        </SubmitButton>
      </form>
    </div>
  );
}
