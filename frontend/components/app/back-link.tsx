import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

/** Back up one level; slides the page out to the right. */
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      className="-ml-2 mb-5 inline-flex h-9 items-center gap-1 rounded-full pr-3 pl-2 text-sm font-medium text-muted-foreground transition-[background-color,color,scale] duration-150 hover:bg-foreground/6 hover:text-foreground active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <CaretLeftIcon aria-hidden="true" className="size-4" weight="bold" />
      {children}
    </Link>
  );
}
