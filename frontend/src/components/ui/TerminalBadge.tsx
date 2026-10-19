import React from "react";

type BadgeVariant = "up" | "down" | "neutral" | "gold" | "slate" | "outline";

interface TerminalBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function TerminalBadge({
  variant = "slate",
  children,
  size = "xs",
  className = "",
}: TerminalBadgeProps) {
  const sizeStyles = {
    xs: "text-[9px] px-1.5 py-0.5 font-semibold tracking-wider",
    sm: "text-[10px] px-2 py-0.5 font-bold tracking-wider",
    md: "text-xs px-2.5 py-1 font-bold tracking-wide",
  }[size];

  const variantStyles = {
    up: "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40",
    down: "bg-red-950/40 text-red-400 border border-red-800/40",
    neutral: "bg-slate-800/60 text-slate-300 border border-slate-700/50",
    gold: "bg-amber-950/40 text-amber-400 border border-amber-800/40",
    slate: "bg-[#181c24] text-slate-400 border border-[#252b37]",
    outline: "bg-transparent text-slate-300 border border-slate-700/60",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono uppercase whitespace-nowrap ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}

export default TerminalBadge;
