import React from "react";
import { FlaskConical } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="mx-5 mb-3 rounded-xl px-3.5 py-3 bg-amber-soft border border-amber/30">
      <div className="flex items-center gap-1.5 mb-1">
        <FlaskConical size={12} className="text-amber" />
        <span className="font-mono text-[9.5px] font-bold tracking-wider text-amber">SAMPLE CASE</span>
      </div>
      <p className="font-body text-[12px] leading-relaxed text-slate">
        You're previewing TruthQuest with a sample case.
      </p>
    </div>
  );
}