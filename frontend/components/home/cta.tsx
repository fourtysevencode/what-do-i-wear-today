import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type CtaProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Pill with the arrow nested in its own circle (button-in-button). */
export function PrimaryCta({ href, children, className }: CtaProps) {
  return (
    <a
      href={href}
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
        <ArrowRight className="size-4" strokeWidth={2} />
      </span>
    </a>
  );
}

export function SecondaryCta({
  href,
  children,
  className,
  external = false,
}: CtaProps & { external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group inline-flex h-12 items-center gap-2 rounded-full border border-foreground/15 px-6 text-[15px] font-medium whitespace-nowrap transition-[background-color,border-color,scale] duration-300 ease-soft hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.98]",
        focusRing,
        className,
      )}
    >
      {children}
      {external && (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2}
        />
      )}
    </a>
  );
}
