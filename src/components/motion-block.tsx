"use client";

import { motion } from "framer-motion";

export function MotionBlock({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="premium-card rounded-lg p-5"
    >
      <p className="font-display text-4xl font-black text-studio-gold">{value}</p>
      <p className="mt-2 text-sm text-white/60">{label}</p>
    </motion.div>
  );
}
