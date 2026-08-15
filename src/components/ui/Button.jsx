import React from "react";

const VARIANTS = {
  navy: "bg-navy text-white shadow-[0_4px_14px_rgba(16,27,61,0.25)] hover:shadow-[0_6px_20px_rgba(16,27,61,0.3)]",
  blue: "bg-blue text-white shadow-[0_4px_14px_rgba(59,111,242,0.3)] hover:shadow-[0_6px_20px_rgba(59,111,242,0.4)]",
  mint: "bg-mint text-white hover:brightness-110",
  outlineRose: "bg-transparent text-rose border-[1.5px] border-rose hover:bg-rose-soft/60",
  ghost: "bg-transparent text-slate-light hover:text-navy",
  soft: "bg-blue-soft text-navy border border-paper-dim hover:border-blue/30",
};

export default function Button({
  children,
  onClick,
  icon: Icon,
  iconPosition = "right",
  variant = "navy",
  disabled,
  loading,
  full = true,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-semibold text-sm font-body transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={16} strokeWidth={2.5} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={16} strokeWidth={2.5} />}
        </>
      )}
    </button>
  );
}
