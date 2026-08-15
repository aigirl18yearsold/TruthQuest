import React from "react";
import { Compass, ArrowRight, MessageSquareText, ShieldCheck, Sparkles, ScanSearch, Globe2 } from "lucide-react";
import Button from "../ui/Button.jsx";

const FEATURES = [
  { icon: MessageSquareText, text: "Real posts from your feed" },
  { icon: ShieldCheck, text: "Investigate like a pro" },
  { icon: Sparkles, text: "Scout guides your thinking" },
  { icon: ScanSearch, text: "Evidence-based clues" },
  { icon: Globe2, text: "Check real sources live" },
];

export default function Home({ onStart }) {
  return (
    <div className="relative flex flex-col h-full px-7 py-10 text-center bg-gradient-to-b from-blue-soft via-blue-soft to-mist overflow-hidden">
      <div className="pointer-events-none select-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue/10 to-transparent blur-2xl" />
      <div className="pointer-events-none select-none absolute bottom-10 -left-20 w-56 h-56 rounded-full bg-gradient-to-tr from-mint/10 to-transparent blur-2xl" />

      <div className="relative flex flex-col items-center gap-5 mt-2">
        <div className="animate-pop relative">
          <div className="flex items-center justify-center rounded-full w-[92px] h-[92px] bg-paper border border-paper-dim shadow-[0_8px_30px_-10px_rgba(16,27,61,0.25)]">
            <Compass size={38} className="text-blue" strokeWidth={2} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-mint text-white rounded-full p-1 shadow-md">
            <Sparkles size={14} />
          </div>
        </div>

        <div className="animate-fade-in">
          <h1 className="font-display text-[30px] font-extrabold text-navy leading-tight tracking-tight">
            Welcome to<br />TruthQuest
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate max-w-[260px] mx-auto">
            Don't just trust the feed. Learn to question it—one case at a time.
          </p>
        </div>
      </div>

      <div className="relative w-full flex flex-col items-center gap-2.5 max-w-[280px] mx-auto mt-6">
        {FEATURES.map(({ icon: Icon, text }, i) => (
          <div
            key={text}
            className="flex items-center gap-2.5 w-full bg-paper/90 backdrop-blur border border-paper-dim/80 rounded-2xl px-3.5 py-3 shadow-sm text-left animate-slide-up"
            style={{ animationDelay: `${i * 60 + 150}ms`, animationFillMode: "both" }}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-soft flex items-center justify-center shrink-0">
              <Icon size={16} className="text-blue" />
            </div>
            <span className="text-[12.5px] font-bold text-navy leading-snug">{text}</span>
          </div>
        ))}
      </div>

      <div className="relative w-full flex flex-col items-center gap-3 mt-auto">
        <Button onClick={onStart} icon={ArrowRight} variant="navy" className="shadow-lg">
          Start Challenge
        </Button>
        <span className="text-[11px] text-slate-light font-medium">
          Built for media literacy learners
        </span>
      </div>
    </div>
  );
}
