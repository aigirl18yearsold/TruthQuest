 import React from "react";
import { Compass, ArrowRight, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import Button from "../ui/Button.jsx";

const FEATURES = [
  { icon: MessageSquareText, text: "Real posts from your feed" },
  { icon: ShieldCheck, text: "Investigate like a pro" },
  { icon: Sparkles, text: "Scout, your AI coach, guides you" },
];

export default function Home({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-between h-full px-7 py-10 text-center bg-gradient-to-b from-blue-soft to-mist">
      <div className="flex flex-col items-center gap-5 mt-4">
        <div className="flex items-center justify-center rounded-full w-[84px] h-[84px] bg-paper border border-paper-dim">
          <Compass size={38} className="text-blue" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-[30px] font-extrabold text-navy leading-tight">
            Welcome to<br />TruthQuest
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate max-w-[260px] mx-auto">
            Learn to question information, not just trust it.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 w-full max-w-[260px]">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <Icon size={16} className="text-blue shrink-0" />
            <span className="text-[13.5px] text-navy font-medium text-left">{text}</span>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col items-center gap-3">
        <Button onClick={onStart} icon={ArrowRight} variant="navy">Start Challenge</Button>
      </div>
    </div>
  );
}