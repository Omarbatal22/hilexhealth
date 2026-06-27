import type { Variants } from "framer-motion";

/** Standard easing from the Motion Bible — never default CSS easing. */
export const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Fade + rise, used by scroll-reveal wrappers. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

/** Container that staggers its children on reveal. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Single staggered child. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

/** Shared viewport config so reveals fire once, slightly before fully in view. */
export const revealViewport = { once: true, margin: "-80px" } as const;
