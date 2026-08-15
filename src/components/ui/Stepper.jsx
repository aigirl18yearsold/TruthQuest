import React from "react";

export const STEP_SCREEN = ["link", "post", "investigate", "coach", "results"];

export default function Stepper({ screen }) {
  const idx = STEP_SCREEN.indexOf(screen);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-1.5 px-5 pb-4 bg-paper">
      {STEP_SCREEN.map((_, i) => (
        <div
          key={i}
          className={`h-[5px] flex-1 rounded-full ${i <= idx ? "bg-navy" : "bg-paper-dim"}`}
        />
      ))}
    </div>
  );
}