import { cn } from "@/lib/utils";

// A textile tile per person, picked from their username so it stays stable.
const tiles = ["bg-sage", "bg-clay", "bg-chambray", "bg-butter"];

const sizes = {
  sm: "size-8 text-sm",
  md: "size-11 text-lg",
  lg: "size-16 text-2xl",
};

export function Monogram({ username, size = "md", className }: { username: string; size?: keyof typeof sizes; className?: string }) {
  const tile = tiles[[...username].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % tiles.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-display font-medium text-swatch-ink uppercase",
        tile,
        sizes[size],
        className,
      )}
    >
      {username.charAt(0)}
    </span>
  );
}
