import React from "react";
import { FlaskConical } from "lucide-react";

export default function DemoBanner({ reason }) {
  return (
    <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg px-3 py-2 bg-amber/10 border border-amber/30">
      <FlaskConical size={13} className="text-amber mt-0.5 shrink-0" />
      <p className="font-mono text-[10px] leading-relaxed text-amber">
        DEMO DATA — {reason || "connect a backend + GEMINI_API_KEY to go live"}
      </p>
    </div>
  );
}