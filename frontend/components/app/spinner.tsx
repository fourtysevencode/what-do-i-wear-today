import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

/** The spinning icon shown inside a button while its request runs. A quick spin reads as a quick wait. */
export function Spinner({ className }: { className?: string }) {
  return (
    <CircleNotchIcon
      aria-hidden="true"
      className={cn("size-4 animate-[spin_0.7s_linear_infinite] motion-reduce:animate-none", className)}
    />
  );
}
