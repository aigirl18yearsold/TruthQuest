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
  misleading: { icon: ShieldAlert, label: "Likely misleading", cls: "text-rose bg-rose-soft border-rose/25" },
  credible: { icon: ShieldCheck, label: "Looks credible", cls: "text-mint bg-mint-soft border-mint/20" },
  unverified: { icon: HelpCircle, label: "Couldn't be verified", cls: "text-amber bg-amber-soft border-amber/25" },
};

export default function Investigate({ analysis, demoMode, onContinue }) {
  const [viewed, setViewed] = useState([]);
  const allViewed = viewed.length === analysis.clues.length;
  const canContinue = viewed.length > 0;
  const toggle = (id) => setViewed((v) => (v.includes(id) ? v : [...v, id]));

  const v = VERDICT_STYLE[analysis.verdict] || VERDICT_STYLE.unverified;
  const VIcon = v.icon;

  return (
    <div className="flex flex-col h-full bg-mist">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-[19px] font-extrabold text-navy">Examine the evidence</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-slate">
          Tap each clue — these findings came from the AI checking the post against live search results.
        </p>
      </div>

      {demoMode && <DemoBanner />}

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-2.5 pb-3">
        {analysis.clues.map((clue) => {
          const open = viewed.includes(clue.id);
          const Icon = ICONS[clue.id] || HelpCircle;
          return (
            <button
              key={clue.id}
              onClick={() => toggle(clue.id)}
              className={`text-left rounded-xl px-4 py-3.5 transition-colors border bg-paper ${
                open ? "border-blue" : "border-paper-dim"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-lg shrink-0 w-[34px] h-[34px] bg-blue-soft">
                  <Icon size={17} className="text-blue" />
                </div>
                <span className="flex-1 font-body font-semibold text-[14.5px] text-navy">{clue.question}</span>
                {open ? <CheckCircle2 size={18} className="text-mint" /> : <Circle size={18} className="text-slate-light" />}
              </div>
              {open && (
                <p className="mt-2.5 pl-[42px] text-[13.5px] leading-relaxed text-slate">{clue.finding}</p>
              )}
            </button>
          );
        })}

        {allViewed && (
          <div className={`mt-1 rounded-xl px-4 py-3 flex items-center gap-2.5 border ${v.cls}`}>
            <VIcon size={19} className="shrink-0" />
            <div>
              <p className="font-semibold text-[14px]">{v.label}</p>
              <p className="text-[11px] opacity-80">{analysis.confidence}% confidence</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 border-t border-paper-dim bg-paper">
        <p className="mb-3 text-center text-[12px] font-medium text-slate">
          {viewed.length}/{analysis.clues.length} clues examined
        </p>
        <Button onClick={onContinue} icon={ChevronRight} disabled={!canContinue}>
          {canContinue ? "Talk It Through With Scout" : "Examine at least one clue to continue"}
        </Button>
      </div>
    </div>
  );
}