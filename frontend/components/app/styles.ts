// Shared field and surface styles. Buttons live in components/ui/button.tsx.
// Shape rule: controls are pills, surfaces use --radius-surface, cards --radius-card.

const focus = "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

// text-base: 16px, or iOS zooms the page when the field gets focus.
export const inputBase = `w-full border border-input bg-card text-base text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] aria-invalid:border-destructive ${focus}`;

export const input = `${inputBase} h-12 rounded-full px-5`;

export const textarea = `${inputBase} min-h-28 resize-y rounded-(--radius-card) px-4 py-3 leading-relaxed`;

export const label = "text-sm font-medium";

export const fieldError = "text-sm text-destructive";

export const surface = "rounded-(--radius-surface) bg-card p-5 shadow-card ring-1 ring-border md:p-6";

/** A text link inside a sentence. */
export const inlineLink =
  "rounded-sm font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-[text-decoration-color] hover:decoration-thread focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";
