// Shared control styles for the signed-in app. Shape rule from the homepage:
// controls are pills, surfaces use --radius-surface, prints use --radius-print.

const focus =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const buttonPrimary = `inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-foreground transition-[background-color,scale,opacity] duration-300 ease-soft hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${focus}`;

export const buttonSecondary = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-foreground/15 px-5 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,scale,opacity] duration-300 ease-soft hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${focus}`;

export const buttonSmall = `inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-[background-color,border-color,scale] duration-300 ease-soft active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${focus}`;

export const inputBase =
  "w-full border border-input bg-card text-[15px] text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive";

export const input = `${inputBase} h-11 rounded-full px-4`;

export const textarea = `${inputBase} min-h-28 resize-y rounded-(--radius-print) px-4 py-3 leading-relaxed`;

export const label = "text-sm font-medium";

export const fieldError = "text-sm text-destructive";

export const surface = "rounded-(--radius-surface) bg-card p-5 ring-1 ring-border md:p-6";
