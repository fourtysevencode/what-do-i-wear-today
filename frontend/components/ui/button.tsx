import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The one button style. Pills; feedback on press (scale on :active, 150ms) and colour
 * changes at 200ms, both on the strong ease-out. While a request runs a button gets
 * aria-busy: it darkens and stays opaque so the press reads as "working".
 * Use `buttonVariants()` to style a <Link> the same way.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none outline-none",
    "[transition:background-color_200ms_var(--ease-out),color_200ms_var(--ease-out),box-shadow_200ms_var(--ease-out),opacity_200ms_var(--ease-out),scale_150ms_var(--ease-out)]",
    "active:scale-[0.97] disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-busy:brightness-[0.85]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-card hover:bg-primary/90",
        secondary: "bg-card text-foreground ring-1 ring-border ring-inset hover:bg-secondary",
        tinted: "bg-secondary text-foreground hover:bg-foreground/10",
        ghost: "text-muted-foreground hover:bg-foreground/6 hover:text-foreground active:bg-foreground/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariantProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
