"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const links = [
  { id: "how", label: "How It Works" },
  { id: "friends", label: "With Friends" },
];

/** Marks the link for whichever section sits across the middle of the viewport. */
export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = ["how", "outfit", "friends"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) setActive(id);
          else setActive((current) => (current === id ? null : current));
        }
      },
      // A thin band at mid-viewport, so only one section matches at a time.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {links.map(({ id, label }) => (
        <Link
          key={id}
          href={`/#${id}`}
          aria-current={active === id ? "true" : undefined}
          className={cn(
            "relative hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline-flex",
            "after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-pop after:transition-transform after:duration-500 after:ease-soft",
            "aria-[current]:text-foreground aria-[current]:after:scale-x-100",
          )}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
