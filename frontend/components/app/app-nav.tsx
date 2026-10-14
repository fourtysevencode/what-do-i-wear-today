"use client";

import { CoatHangerIcon, TShirtIcon, UserCircleIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const appSections: { href: string; label: string; icon: Icon }[] = [
  { href: "/wardrobe", label: "Wardrobe", icon: TShirtIcon },
  { href: "/outfits", label: "Outfits", icon: CoatHangerIcon },
  { href: "/friends", label: "Friends", icon: UsersThreeIcon },
  { href: "/account", label: "Account", icon: UserCircleIcon },
];

export function useActiveSection() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

const itemClass =
  "flex h-11 items-center gap-3 rounded-full px-4 text-[0.9375rem] font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Static links for the prerendered shell; the active state fills in on the client. */
export function AppNavFallback() {
  return (
    <>
      {appSections.map(({ href, label, icon: SectionIcon }) => (
        <Link key={href} href={href} className={cn(itemClass, "text-muted-foreground")}>
          <SectionIcon aria-hidden="true" className="size-5" />
          {label}
        </Link>
      ))}
    </>
  );
}

/** The desktop sidebar's section links. Phones use <TabBar>. */
export function AppNav() {
  const isActive = useActiveSection();
  return (
    <>
      {appSections.map(({ href, label, icon: SectionIcon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              itemClass,
              active ? "bg-card text-foreground shadow-card ring-1 ring-border" : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
            )}
          >
            <SectionIcon aria-hidden="true" className="size-5" weight={active ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
