"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Decorative background layer for the hero.
 * Pure decoration — aria-hidden, pointer-events-none, sits behind content.
 * Floating crosses, accent dots, soft blurred glows and a thin curved
 * "medical connection" line, matching the reference art direction.
 */
export function HeroDecorations({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Soft blurred background glows */}
      <div className="absolute -right-32 -top-24 h-[640px] w-[640px] rounded-full bg-primary-soft/50 blur-[120px]" />
      <div className="absolute right-1/4 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan/20 blur-[120px]" />
      <div className="absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-primary-bg blur-[100px]" />

      {/* Floating medical crosses */}
      <FloatingCross className="left-[46%] top-[18%] text-teal/70" size={26} delay={0} />
      <FloatingCross className="right-[16%] top-[8%] text-primary/80" size={30} delay={0.6} />
      <FloatingCross className="right-[4%] top-[26%] text-primary-light/80" size={20} delay={1.1} />
      <FloatingCross className="left-[40%] top-[58%] text-teal/60" size={18} delay={0.3} />

      {/* Accent particles */}
      <Dot className="right-[8%] top-[40%] bg-primary" size={10} delay={0.2} />
      <Dot className="left-[44%] top-[34%] bg-primary-light" size={8} delay={0.8} />
      <Dot className="right-[30%] top-[14%] bg-cyan" size={7} delay={1.2} />
      <Dot className="right-[22%] bottom-[18%] bg-teal" size={9} delay={0.5} />
      <Dot className="right-[12%] bottom-[8%] bg-coral/70" size={7} delay={1.5} />

      {/* Thin curved medical connection line */}
      <svg
        className="absolute right-[10%] top-[30%] h-44 w-72 text-primary/30"
        viewBox="0 0 300 180"
        fill="none"
      >
        <motion.path
          d="M2,90 C70,20 130,160 200,90 C240,52 270,70 298,40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 8"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
      </svg>

      {/* Dotted texture, bottom-right (matches reference) */}
      <DotGrid className="right-[2%] bottom-[6%]" />
    </div>
  );
}

function FloatingCross({
  className,
  size = 24,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn("absolute", className)}
      animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Plus size={size} strokeWidth={3} className="drop-shadow-sm" />
    </motion.div>
  );
}

function Dot({
  className,
  size = 8,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.span
      className={cn("absolute rounded-full", className)}
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function DotGrid({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute h-24 w-32 text-primary/20", className)}
      viewBox="0 0 120 80"
      fill="none"
    >
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 8 }).map((__, col) => (
          <circle
            key={`${row}-${col}`}
            cx={6 + col * 15}
            cy={6 + row * 14}
            r="2.5"
            fill="currentColor"
          />
        ))
      )}
    </svg>
  );
}
