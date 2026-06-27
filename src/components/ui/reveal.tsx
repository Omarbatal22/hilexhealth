"use client";

import { motion, type Variants } from "framer-motion";
import * as React from "react";
import { fadeUp, revealViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * React's DOM drag/animation handler signatures collide with framer-motion's,
 * so drop them from the passthrough props (we don't use them here anyway).
 */
type DivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

interface RevealProps extends DivProps {
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Override the default fade-up variants. */
  variants?: Variants;
  as?: "div" | "section" | "li" | "span";
}

/**
 * Scroll-reveal wrapper. Fades + rises content once it enters the viewport.
 * Honors reduced-motion automatically (Framer reads the media query).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={variants}
      transition={delay ? { delay } : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
