import React from "react";

export const STEP_SCREEN = ["link", "post", "investigate", "reasoning", "coach", "results"];

const STEP_LABELS = {
  link: "New",
  post: "Review",
  investigate: "Evidence",
  reasoning: "Reasoning",
  coach: "Scout",
  results: "Score",
};

export default function Stepper({ screen }) {
  const idx = STEP_SCREEN.indexOf(screen);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-1.5 px-5 pb-4 bg-paper/60">
      {STEP_SCREEN.map((step, i) => {
        const active = i <= idx;
        const current = i === idx;
        return (
          <div key={step} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`h-[5px] w-full rounded-full transition-all duration-500 ${
                active ? "bg-navy" : "bg-paper-dim"
              }`}
            />
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                current ? "text-navy" : active ? "text-slate-light" : "text-slate-light/50"
              }`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
