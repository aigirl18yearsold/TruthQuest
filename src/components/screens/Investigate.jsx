import React, { useState } from "react";
import {
  Newspaper, Link2, BarChart3, Hash, Flame, Globe,
  CheckCircle2, Circle, ChevronRight, ShieldAlert, ShieldCheck, HelpCircle,
} from "lucide-react";
import Button from "../ui/Button.jsx";
import DemoBanner from "../ui/DemoBanner.jsx";

const ICONS = {
  publisher: Newspaper,
  source: Link2,
  evidence: BarChart3,
  statistic: Hash,
  language: Flame,
  crosscheck: Globe,
};

const VERDICT_STYLE = {
  misleading: { icon: ShieldAlert, label: "Likely misleading", cls: "text-red bg-red/10 border-red/30" },
  credible: { icon: ShieldCheck, label: "Looks credible", cls: "text-teal bg-teal/10 border-teal/30" },
  unverified: { icon: HelpCircle, label: "Couldn't be verified", cls: "text-amber bg-amber/10 border-amber/30" },
};

export default function Investigate({ analysis, demoMode, demoReason, onContinue }) {
  const [viewed, setViewed] = useState([]);
  const allViewed = viewed.length === analysis.clues.length;
  const toggle = (id) => setViewed((v) => (v.includes(id) ? v : [...v, id]));

  const v = VERDICT_STYLE[analysis.verdict] || VERDICT_STYLE.unverified;
  const VIcon = v.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-1 pb-3">
        <h2 className="font-display text-[20px] font-semibold text-paper">Examine the evidence</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-light">
          Tap each clue — these findings came from the AI checking the post against live search results.
        </p>
      </div>

      {demoMode && <DemoBanner reason={demoReason || "showing sample findings"} />}

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-2.5 pb-3">
        {analysis.clues.map((clue) => {
          const open = viewed.includes(clue.id);
          const Icon = ICONS[clue.id] || HelpCircle;
          return (
            <button
              key={clue.id}
              onClick={() => toggle(clue.id)}
              className={`text-left rounded-xl px-4 py-3.5 transition-colors border ${
                open ? "bg-ink-soft border-amber/35" : "bg-transparent border-ink-line"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex items-center justify-center rounded-lg shrink-0 w-[30px] h-[30px] ${open ? "bg-amber" : "bg-ink-line/35"}`}>
                  <Icon size={15} className={open ? "text-ink" : "text-slate-light"} />
                </div>
                <span className="flex-1 font-body font-semibold text-[13.5px] text-paper">{clue.question}</span>
                {open ? <CheckCircle2 size={16} className="text-teal" /> : <Circle size={16} className="text-slate-light" />}
              </div>
              {open && (
                <p className="mt-2.5 pl-[42px] text-[12.5px] leading-relaxed text-slate-light">{clue.finding}</p>
              )}
            </button>
          );
        })}

        {allViewed && (
          <div className={`mt-1 rounded-xl px-4 py-3 flex items-center gap-2.5 border ${v.cls}`}>
            <VIcon size={17} className="shrink-0" />
            <div>
              <p className="font-semibold text-[13px]">{v.label}</p>
              <p className="font-mono text-[10px] opacity-80">{analysis.confidence}% confidence</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 border-t border-ink-line">
        <p className="mb-3 text-center font-mono text-[10.5px] text-slate-light">
          {viewed.length}/{analysis.clues.length} CLUES EXAMINED
        </p>
        <Button onClick={onContinue} icon={ChevronRight} disabled={!allViewed}>
          {allViewed ? "Talk It Through With Your Coach" : "Examine all clues to continue"}
        </Button>
      </div>
    </div>
  );
}