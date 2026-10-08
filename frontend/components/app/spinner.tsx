import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

/** The spinning icon shown inside a button while its request runs. */
export function Spinner({ className }: { className?: string }) {
  return <CircleNotchIcon aria-hidden="true" className={cn("size-4 animate-spin motion-reduce:animate-none", className)} />;
}
