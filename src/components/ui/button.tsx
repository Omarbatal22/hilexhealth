import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_8px_24px_-6px_rgba(59,130,246,0.5)] hover:bg-[#2f6fe0] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-6px_rgba(59,130,246,0.55)]",
        navy: "bg-navy text-white hover:bg-navy-light hover:-translate-y-0.5",
        outline:
          "border border-primary/60 bg-white text-primary hover:bg-primary-bg hover:border-primary",
        ghost: "bg-transparent text-ink-soft hover:bg-primary-bg hover:text-primary",
        ai: "bg-ai text-white shadow-[0_10px_28px_-8px_rgba(124,58,237,0.55)] hover:bg-[#6d2fd6] hover:-translate-y-0.5",
        white:
          "bg-white text-navy shadow-[0_2px_6px_rgba(15,23,42,0.06)] hover:bg-primary-bg",
      },
      size: {
        sm: "h-9 rounded-xl px-4 text-sm",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-13 rounded-2xl px-7 text-base",
        pill: "h-11 rounded-full px-6 text-sm",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
