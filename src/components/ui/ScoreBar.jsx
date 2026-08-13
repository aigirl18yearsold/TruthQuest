import React from "react";

export default function ScoreBar({ label, value, colorClass = "bg-teal-dark" }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-[12.5px] font-semibold text-ink">{label}</span>
        <span className={`font-mono text-[12.5px] font-semibold ${colorClass.replace("bg-", "text-")}`}>{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-paper-dim">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}