import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-150 ease-out select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background shadow-[0_1px_0_rgb(255_255_255/0.08)_inset] hover:bg-foreground/92",
        accent: "bg-accent text-accent-contrast hover:bg-accent/90",
        secondary: "bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line)] hover:bg-surface-3",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        outline: "text-foreground shadow-[0_0_0_1px_var(--line-strong)] hover:bg-surface-2",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-3.5",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
