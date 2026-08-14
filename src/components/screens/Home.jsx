import React from "react";
import { Search, ArrowRight } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function Home({ onStart }) {
  return (
    <div
      className="flex flex-col items-center justify-between h-full px-7 py-10 text-center"
      style={{ background: "radial-gradient(circle at 50% 0%, #232A4D, #161B33 65%)" }}
    >
      <span className="font-mono text-[11px] tracking-[3px] text-amber mt-4">
        MEDIA LITERACY FIELD KIT
      </span>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center rounded-full w-[84px] h-[84px] bg-ink-soft border border-ink-line">
          <Search size={34} className="text-amber" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-[40px] font-semibold text-paper leading-[1.05]">
            Truth<span className="text-amber italic">Quest</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-light max-w-[280px] mx-auto">
            Paste a real post from your feed. An AI coach — backed by live web search — helps you
            investigate it like a detective, instead of just telling you what to think.
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 font-mono text-[10px] text-slate-light">
          <span>REAL POSTS</span>
          <span className="opacity-40">·</span>
          <span>LIVE AI COACH</span>
          <span className="opacity-40">·</span>
          <span>WEB-GROUNDED</span>
        </div>
        <Button onClick={onStart} icon={ArrowRight}>Start Investigating</Button>
      </div>
    </div>
  );
}