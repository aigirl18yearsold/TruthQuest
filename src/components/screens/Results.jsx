import React from "react";
import { GraduationCap, ArrowRight, RotateCcw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Button from "../ui/Button.jsx";
import ScoreBar from "../ui/ScoreBar.jsx";
import DemoBanner from "../ui/DemoBanner.jsx";

function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

function tierFor(score) {
  if (score >= 85) return "Great Explorer!";
  if (score >= 70) return "Sharp Investigator";
  if (score >= 50) return "Getting There";
  return "Keep Practicing";
}

const RADAR_ITEMS = [
  { key: "sourceChecking", label: "Source Checking", icon: "🔎" },
  { key: "evidenceEvaluation", label: "Evidence Evaluation", icon: "📊" },
  { key: "manipulationDetection", label: "Manipulation Detection", icon: "🛡️" },
];

export default function Results({ scores, demoMode, onNext, onReplay }) {
  const overall = clamp((scores.sourceChecking + scores.evidenceEvaluation + scores.manipulationDetection) / 3);

  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="relative flex flex-col h-full bg-mist">
      <div className="pointer-events-none select-none absolute bottom-0 right-0 w-56 h-56 rounded-full bg-mint/10 blur-3xl" />

      <div className="relative flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-4">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy text-white mb-3 shadow-lg">
            <GraduationCap size={22} />
          </div>
          <p className="text-[12px] font-bold text-slate uppercase tracking-wider">Case closed</p>
          <h2 className="font-display text-[22px] font-extrabold text-navy mt-1 tracking-tight">
            Your Media Literacy Score
          </h2>
        </div>

        {demoMode && <DemoBanner />}

        <div className="rounded-3xl bg-navy px-5 py-7 flex flex-col items-center relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <p className="relative text-[13px] font-bold text-white/70 mb-1">Overall score</p>
          <div className="relative flex items-baseline gap-1">
            <span className="font-display text-[52px] font-extrabold text-mint leading-none tabular-nums">{overall}</span>
            <span className="text-[15px] font-bold text-white/50">/100</span>
          </div>
          <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white border border-white/10">
            <Sparkles size={13} className="text-mint" /> {tierFor(overall)}
          </span>
        </div>

        <div className="mt-4 rounded-2xl px-4 py-4 bg-paper border border-paper-dim shadow-sm">
          {RADAR_ITEMS.map((item) => (
            <ScoreBar key={item.key} label={item.label} value={scores[item.key]} colorClass="bg-navy" />
          ))}
        </div>

        {scores.summary && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-4 w-full rounded-2xl px-4 py-3.5 flex items-start gap-2.5 bg-blue-soft border border-blue/10 text-left hover:border-blue/30 transition-colors shadow-sm"
          >
            <GraduationCap size={18} className="text-blue shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-navy uppercase tracking-wider">Coach notes</p>
                {expanded ? <ChevronUp size={14} className="text-slate" /> : <ChevronDown size={14} className="text-slate" />}
              </div>
              <p className="text-[12.5px] leading-relaxed text-slate mt-1">{scores.summary}</p>
            </div>
          </button>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 flex flex-col gap-2.5 bg-paper/80 backdrop-blur border-t border-paper-dim/60">
        <Button onClick={onNext} icon={ArrowRight} variant="navy" className="shadow-lg">
          Investigate Another Post
        </Button>
        <button
          onClick={onReplay}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[11.5px] font-bold text-slate hover:text-blue transition-colors"
        >
          <RotateCcw size={12} />
          Start over
        </button>
      </div>
    </div>
  );
}
