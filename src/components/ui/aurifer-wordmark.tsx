"use client";

import { cn } from "@/lib/utils";

type AuriferWordmarkProps = {
  className?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: {
    aurifer: "text-[1.9rem] tracking-[0.01em]",
    tax: "text-[1.05rem] relative top-[0.04em]",
    gap: "gap-[0.04em]",
  },
  md: {
    aurifer: "text-[2.6rem] tracking-[0.012em]",
    tax: "text-[1.45rem] relative top-[0.04em]",
    gap: "gap-[0.045em]",
  },
  lg: {
    aurifer: "text-[3.7rem] tracking-[0.014em]",
    tax: "text-[2rem] relative top-[0.04em]",
    gap: "gap-[0.05em]",
  },
} as const;

export function AuriferWordmark({
  className,
  tone = "dark",
  size = "md",
}: AuriferWordmarkProps) {
  const palette = tone === "light" ? "text-white" : "text-[#1b1b1b]";
  const classes = sizeClasses[size];

  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap leading-none",
        classes.gap,
        palette,
        className,
      )}
      style={{ fontFamily: "var(--font-philosopher), Georgia, serif" }}
      aria-label="AURIFER.tax"
    >
      <span className={cn("font-normal", classes.aurifer)}>AURIFER</span>
      <span className={cn("font-normal", classes.tax)}>.tax</span>
    </span>
  );
}
