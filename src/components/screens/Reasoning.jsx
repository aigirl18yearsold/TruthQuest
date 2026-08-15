import React, { useState } from "react";
import { CheckSquare, PencilLine, ArrowRight } from "lucide-react";

const ITEMS = [
  { id: "source", label: "I checked who published this" },
  { id: "evidence", label: "I looked for evidence or an original source" },
  { id: "language", label: "I noticed emotionally manipulative language" },
  { id: "crosscheck", label: "I compared it with another reliable source" },
  { id: "confidence", label: "I feel confident about my decision" },
];

export default function Reasoning({ onContinue }) {
  const [checked, setChecked] = useState([]);
  const [note, setNote] = useState("");

  const toggle = (id) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canContinue = checked.length > 0;

  return (
    <div className="relative flex flex-col h-full bg-mist">
      <div className="pointer-events-none select-none absolute -top-10 -right-10 w-60 h-60 rounded-full bg-blue/10 blur-3xl" />

      <div className="relative px-5 pt-4 pb-2">
        <h2 className="font-display text-[19px] font-extrabold text-navy tracking-tight">
          Explain your decision
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">
          Which checks did you use, and why did you make the call you did?
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar px-5 pb-4 flex flex-col gap-3">
        <div className="rounded-2xl bg-paper border border-paper-dim shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={18} className="text-blue" />
            <p className="text-[13px] font-extrabold text-navy">My checks</p>
          </div>

          <div className="flex flex-col gap-2">
            {ITEMS.map((item) => {
              const active = checked.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border text-left transition-all ${
                    active ? "bg-blue-soft border-blue/30 shadow-sm" : "bg-paper border-paper-dim"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      active ? "bg-blue border-blue text-white" : "border-slate/30 bg-paper"
                    }`}
                  >
                    {active && <ArrowRight size={12} className="rotate-45" />}
                  </div>
                  <span className={`text-[13px] font-semibold ${active ? "text-navy" : "text-slate"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-paper border border-paper-dim shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <PencilLine size={18} className="text-mint" />
            <p className="text-[13px] font-extrabold text-navy">Your reasoning</p>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made you decide to trust, investigate further, or not trust this post?"
            className="w-full h-28 rounded-xl bg-mist/60 border border-paper-dim px-3 py-2.5 text-[13px] text-navy placeholder:text-slate-light focus:outline-none focus:border-blue resize-none"
          />
        </div>
      </div>

      <div className="px-5 pt-3 pb-6 bg-paper/80 backdrop-blur border-t border-paper-dim/60">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`w-full rounded-2xl py-3 font-bold text-[13px] shadow-lg transition-all ${
            canContinue ? "bg-navy text-white active:scale-[0.98]" : "bg-slate/20 text-slate"
          }`}
        >
          {canContinue ? "Talk It Through With Scout" : "Select at least one check to continue"}
        </button>
      </div>
    </div>
  );
}
