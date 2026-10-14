"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

const links = [
  { id: "how", label: "How It Works" },
  { id: "outfit", label: "Try It" },
  { id: "friends", label: "With Friends" },
];

/**
 * Marks the link for whichever section sits across the middle of the viewport. One underline
 * slides between links (rather than one retracting while another grows), so the eye follows
 * a single object.
 */
export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    const sections = links
      .map(({ id }) => document.getElementById(id))
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

  useLayoutEffect(() => {
    const link = active ? linkRefs.current.get(active) : undefined;
    // Keep the last position while hidden, so the bar fades out in place.
    if (link) setBar({ left: link.offsetLeft + 16, width: link.offsetWidth - 32 });
  }, [active]);

  return (
    <div className="relative hidden items-center md:flex">
      {links.map(({ id, label }) => (
        <Link
          key={id}
          ref={(el) => {
            if (el) linkRefs.current.set(id, el);
          }}
          href={`/#${id}`}
          aria-current={active === id ? "true" : undefined}
          className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current]:text-foreground"
        >
          {label}
        </Link>
      ))}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-0 h-0.5 w-(--w) translate-x-(--x) rounded-full bg-thread transition-[translate,width,opacity] duration-200 ease-out motion-reduce:transition-[opacity]"
        style={{ "--x": `${bar?.left ?? 0}px`, "--w": `${bar?.width ?? 0}px`, opacity: active && bar ? 1 : 0 } as CSSProperties}
      />
    </div>
  );
}
