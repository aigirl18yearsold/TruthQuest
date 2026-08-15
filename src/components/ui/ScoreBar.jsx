import React from "react";

export default function ScoreBar({ label, value, colorClass = "bg-navy" }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-[13px] font-semibold text-navy">{label}</span>
        <span className="font-body text-[13px] font-bold text-navy tabular-nums">{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-paper-dim relative">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${colorClass}`}
          style={{ width: `${value}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}
