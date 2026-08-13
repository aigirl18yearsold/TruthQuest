import React from "react";

const VARIANTS = {
  amber: "bg-amber text-ink shadow-[0_4px_14px_rgba(232,163,61,0.25)]",
  teal: "bg-teal text-ink",
  outlineRed: "bg-transparent text-red border-[1.5px] border-red",
  ghost: "bg-transparent text-slate-light",
  dark: "bg-ink-soft text-paper border border-ink-line",
};

export default function Button({
  children,
  onClick,
  icon: Icon,
  iconPosition = "right",
  variant = "amber",
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
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-semibold text-sm font-body transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
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