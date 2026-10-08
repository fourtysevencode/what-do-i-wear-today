"use client";

import { CoatHangerIcon, TShirtIcon, UserCircleIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/wardrobe", label: "Wardrobe", Icon: TShirtIcon },
  { href: "/outfits", label: "Outfits", Icon: CoatHangerIcon },
  { href: "/friends", label: "Friends", Icon: UsersThreeIcon },
  { href: "/account", label: "Account", Icon: UserCircleIcon },
];

const itemClass =
  "flex h-10 items-center gap-3 rounded-full px-3 text-sm sm:px-4 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Static links for the prerendered shell; the active state fills in on the client. */
export function AppNavFallback() {
  return (
    <>
      {items.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={cn(itemClass, "text-muted-foreground")}>
          <Icon aria-hidden="true" className="size-5" />
          <span className="max-sm:sr-only">{label}</span>
        </Link>
      ))}
    </>
  );
}

export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              itemClass,
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-5" weight={active ? "fill" : "regular"} />
            <span className="max-sm:sr-only">{label}</span>
          </Link>
        );
      })}
    </>
  );
}
