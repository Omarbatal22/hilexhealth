import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function SuccessOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white rounded-[var(--radius-xl2)]"
    >
      <div className="relative flex flex-col items-center">
        {/* Pulsing ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.15 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
          className="absolute h-24 w-24 rounded-full bg-success"
        />
        
        {/* Solid green check circle */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lg shadow-success/20"
        >
          <Check className="h-10 w-10" strokeWidth={3} />
        </motion.div>

        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 font-display text-xl font-bold text-navy"
        >
          Account Created!
        </motion.h3>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-sm text-ink-soft text-center px-6"
        >
          Preparing your workspace...
        </motion.p>
      </div>
    </motion.div>
  );
}
