import { LockSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Suspense } from "react";

import { adminLogout } from "@/app/fourtysevencode/actions";
import { AdminLogin } from "@/app/fourtysevencode/admin-login";
import { buttonSmall, surface } from "@/components/app/styles";
import { getAdminStats, isAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

// Not linked anywhere, and kept out of search engines.
export const metadata: Metadata = {
  title: "Stats · What do I wear today?",
  robots: { index: false, follow: false },
};

const count = new Intl.NumberFormat("en");
const joinedOn = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className={surface}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-4xl font-semibold tracking-tight tabular-nums">{count.format(value)}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

async function Dashboard() {
  if (!(await isAdmin())) {
    return (
      <div className={cn(surface, "max-w-md")}>
        <p className="mb-5 flex items-center gap-2 font-medium">
          <LockSimpleIcon aria-hidden="true" className="size-5" />
          Owner only
        </p>
        <AdminLogin />
      </div>
    );
  }

  const { totals, users } = await getAdminStats();
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Outfits built" value={totals.outfitsBuilt} hint="Every outfit the stylist made" />
        <StatTile label="Outfits saved" value={totals.outfitsSaved} />
        <StatTile label="Users joined" value={totals.users} />
        <StatTile label="Clothing items added" value={totals.garments} hint="Currently in wardrobes" />
      </div>

      <section aria-labelledby="users-title" className={cn(surface, "mt-6 overflow-x-auto p-0 md:p-0")}>
        <h2 id="users-title" className="px-5 pt-5 font-heading text-lg font-semibold tracking-tight md:px-6">
          Users <span className="font-sans text-sm font-normal text-muted-foreground tabular-nums">{users.length}</span>
        </h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="px-5 py-2 font-medium md:px-6">Username</th>
              <th scope="col" className="px-3 py-2 font-medium">Joined</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Clothes</th>
              <th scope="col" className="px-5 py-2 text-right font-medium md:px-6">Outfits</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium md:px-6" translate="no">
                  @{user.username}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                  <time dateTime={new Date(user.joined).toISOString()}>{joinedOn.format(new Date(user.joined))}</time>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{count.format(user.garments)}</td>
                <td className="px-5 py-3 text-right tabular-nums md:px-6">{count.format(user.outfits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <form action={adminLogout} className="mt-6">
        <button type="submit" className={cn(buttonSmall, "border border-foreground/15 hover:bg-foreground/5")}>
          Lock
        </button>
      </form>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="type-display text-4xl md:text-5xl">Stats</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Everyone using What do I wear today.</p>
      <Suspense fallback={<div aria-hidden="true" className="h-40 animate-pulse rounded-(--radius-surface) bg-muted motion-reduce:animate-none" />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
