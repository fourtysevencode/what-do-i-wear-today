import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type CtaProps = {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
};

const externalProps = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Pill with the arrow nested in its own circle (button-in-button). */
export function PrimaryCta({ href, children, className, external = false }: CtaProps) {
  const Arrow = external ? ArrowUpRightIcon : ArrowRightIcon;
  const Anchor = external ? "a" : Link;
  return (
    <Anchor
      href={href}
      {...(external ? externalProps : {})}
      className={cn(
        "group inline-flex h-12 items-center gap-3 rounded-full bg-primary pr-1.5 pl-6 text-[15px] font-medium whitespace-nowrap text-primary-foreground transition-[background-color,scale] duration-300 ease-soft hover:bg-primary/90 active:scale-[0.98]",
        focusRing,
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 transition-[translate,scale] duration-500 ease-spring group-hover:translate-x-0.5 group-hover:scale-105"
      >
        <Arrow className="size-4" weight="bold" />
      </span>
    </Anchor>
  );
}

/** Tertiary text link, so the primary pill is the only filled control. */
export function TextCta({ href, children, className }: Omit<CtaProps, "external">) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium whitespace-nowrap underline decoration-foreground/25 underline-offset-[6px] transition-[text-decoration-color] duration-300 ease-soft hover:decoration-pop",
        focusRing,
        className,
      )}
    >
      {children}
      <ArrowRightIcon
        aria-hidden="true"
        className="size-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5"
      />
    </Link>
  );
}
