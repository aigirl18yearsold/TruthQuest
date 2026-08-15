import React, { useState } from "react";
import { Lightbulb, ShieldCheck, Globe2, Search, Scale, BookOpen } from "lucide-react";

const PRINCIPLES = [
  {
    icon: Lightbulb,
    title: "Pause before you share",
    text: "Strong claims need strong evidence. Take a breath before you hit share.",
  },
  {
    icon: ShieldCheck,
    title: "Check the source",
    text: "Who made this? Are they credible? Can you verify them independently?",
  },
  {
    icon: Globe2,
    title: "Find the original",
    text: "Is there an original study, article, or firsthand account behind this claim?",
  },
  {
    icon: Search,
    title: "Look for evidence",
    text: "Data, methods, sample size, and dates matter more than confident tone.",
  },
  {
    icon: Scale,
    title: "Watch the language",
    text: "Urgency words, ALL CAPS, and emoji often signal manipulation, not information.",
  },
  {
    icon: BookOpen,
    title: "Trust verification, not vibes",
    text: "Your instinct is useful, but verification turns instinct into judgment.",
  },
];

export default function Principles({ onContinue }) {
  const [seen, setSeen] = useState(false);
  return (
    <div className="relative flex flex-col h-full bg-mist">
      <div className="pointer-events-none select-none absolute -top-10 -left-10 w-60 h-60 rounded-full bg-mint/10 blur-3xl" />

      <div className="relative px-5 pt-4 pb-2">
        <h2 className="font-display text-[19px] font-extrabold text-navy tracking-tight">
          TruthQuest Principles
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">
          Six simple checks to help anyone separate signal from noise.
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <div className="grid grid-cols-1 gap-2.5">
          {PRINCIPLES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl bg-paper border border-paper-dim px-4 py-3.5 shadow-sm animate-slide-up"
                style={{ animationDelay: `${idx * 50 + 100}ms`, animationFillMode: "both" }}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-soft flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-blue" />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-navy leading-snug">{item.title}</p>
                  <p className="text-[12.5px] leading-relaxed text-slate mt-0.5">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-3 pb-6 bg-paper/80 backdrop-blur border-t border-paper-dim/60">
        <button
          onClick={() => setSeen((s) => !s)}
          className="text-[11.5px] font-bold text-slate hover:text-blue transition-colors mb-2"
        >
          {seen ? "Hide tip" : "Show me a quick tip"}
        </button>
        {seen && (
          <div className="rounded-2xl bg-blue-soft/80 border border-blue/10 px-4 py-3 text-left animate-slide-up">
            <p className="text-[12.5px] leading-relaxed text-navy">
              Start with source and evidence. If either is weak, keep investigating before you decide
              whether to trust, share, or dismiss a claim.
            </p>
          </div>
        )}
        <button
          onClick={onContinue}
          className="mt-3 w-full rounded-2xl bg-navy text-white font-bold text-[13px] py-3 shadow-lg active:scale-[0.98] transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
