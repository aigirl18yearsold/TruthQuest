import React, { useState } from "react";
import {
  Newspaper, Link2, BarChart3, Hash, Flame, Globe,
  CheckCircle2, Circle, ChevronRight, ShieldAlert, ShieldCheck, HelpCircle,
  Gauge
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

  const evidencePct = allViewed ? analysis.confidence : Math.round((viewed.length / Math.max(1, analysis.clues.length)) * 100);

  return (
    <div className="relative flex flex-col h-full bg-mist">
      <div className="pointer-events-none select-none absolute bottom-0 left-0 w-48 h-48 rounded-full bg-mint/10 blur-3xl" />

      <div className="relative px-5 pt-4 pb-3">
        <h2 className="font-display text-[19px] font-extrabold text-navy tracking-tight">Examine the evidence</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">
          Tap each clue to reveal Scout's findings. The more you review, the clearer the picture becomes.
        </p>

        {!allViewed && (
          <div className="mt-3 flex items-center gap-2 rounded-full bg-paper border border-paper-dim px-3 py-2 shadow-sm">
            <Gauge size={16} className="text-blue" />
            <span className="text-[11.5px] font-bold text-slate">Evidence strength</span>
            <span className="ml-auto text-[11.5px] font-black text-navy tabular-nums">{evidencePct}%</span>
          </div>
        )}
      </div>

      {demoMode && <DemoBanner />}

      <div className="relative flex-1 overflow-y-auto no-scrollbar px-5 flex flex-col gap-2.5 pb-3">
        {analysis.clues.map((clue, idx) => {
          const open = viewed.includes(clue.id);
          const Icon = ICONS[clue.id] || HelpCircle;
          return (
            <button
              key={clue.id}
              onClick={() => toggle(clue.id)}
              className={`group text-left rounded-2xl px-4 py-3.5 transition-all duration-200 border bg-paper hover:shadow-md ${
                open ? "border-blue shadow-sm" : "border-paper-dim"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex items-center justify-center rounded-xl shrink-0 w-[34px] h-[34px transition-colors ${open ? "bg-blue text-white" : "bg-blue-soft text-blue"}`}>
                  <Icon size={17} />
                </div>
                <span className="flex-1 font-body font-bold text-[14.5px] text-navy">{clue.question}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${open ? "bg-mint-soft text-mint" : "bg-paper text-slate-light"}`}>
                  {open ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
              </div>
              {open && (
                <div className="mt-3 ml-[42px] animate-slide-up" style={{ animationFillMode: "backwards" }}>
                  <div className="h-px bg-paper-dim mb-2.5" />
                  <p className="text-[13.5px] leading-relaxed text-slate">{clue.finding}</p>
                </div>
              )}
            </button>
          );
        })}

        {allViewed && (
          <div className={`mt-2 rounded-2xl px-4 py-3.5 flex items-center gap-3 border animate-pop shadow-sm ${v.cls}`}>
            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0">
              <VIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-[14px]">{v.label}</p>
              <p className="text-[11px] opacity-80">{analysis.confidence}% confidence from evidence review</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 border-t border-paper-dim bg-paper/80 backdrop-blur">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 bg-paper-dim" />
          <p className="text-[12px] font-bold text-slate uppercase tracking-wider">
            {viewed.length}/{analysis.clues.length} clues examined
          </p>
          <div className="h-px flex-1 bg-paper-dim" />
        </div>
        <Button
          onClick={onContinue}
          icon={ChevronRight}
          disabled={!canContinue}
          className={canContinue ? "shadow-lg" : ""}
        >
          {canContinue ? "Talk It Through With Scout" : "Examine at least one clue to continue"}
        </Button>
      </div>
    </div>
  );
}
