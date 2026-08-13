import React from "react";
import { CheckCircle2 } from "lucide-react";

export const STEPS = ["Link", "Post", "Investigate", "Coach", "Results"];
export const STEP_SCREEN = ["link", "post", "investigate", "coach", "results"];

export default function Stepper({ screen }) {
  const idx = STEP_SCREEN.indexOf(screen);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-1 px-5 pt-3 pb-3">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center justify-center rounded-full shrink-0" style={{ opacity: i <= idx ? 1 : 0.35 }}>
            <div
              className={`flex items-center justify-center rounded-full w-5 h-5 ${
                i < idx ? "bg-teal" : i === idx ? "bg-amber" : "bg-transparent border border-slate-light"
              }`}
            >
              {i < idx ? (
                <CheckCircle2 size={13} className="text-ink" strokeWidth={2.5} />
              ) : (
                <span className={`font-mono text-[10px] font-semibold ${i === idx ? "text-ink" : "text-slate-light"}`}>
                  {i + 1}
                </span>
              )}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px ${i < idx ? "bg-teal" : "bg-ink-line"}`} style={{ opacity: i < idx ? 1 : 0.5 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}