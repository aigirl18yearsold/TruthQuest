import React from "react";
import { FlaskConical } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="mx-5 mb-3 rounded-xl px-3.5 py-3 bg-amber/[0.08] border border-amber/25">
      <div className="flex items-center gap-1.5 mb-1">
        <FlaskConical size={12} className="text-amber" />
        <span className="font-mono text-[9.5px] font-semibold tracking-wider text-amber">SAMPLE CASE</span>
      </div>
      <p className="font-body text-[12px] leading-relaxed text-slate-light">
        You're previewing TruthQuest with a sample case.
      </p>
    </div>
  );
}