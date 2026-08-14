import React from "react";
import { GraduationCap, ArrowRight, RotateCcw } from "lucide-react";
import Button from "../ui/Button.jsx";
import ScoreBar from "../ui/ScoreBar.jsx";
import DemoBanner from "../ui/DemoBanner.jsx";

function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

export default function Results({ scores, demoMode, demoReason, onNext, onReplay }) {
  const overall = clamp((scores.sourceChecking + scores.evidenceEvaluation + scores.manipulationDetection) / 3);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4">
        <div className="text-center mb-5">
          <p className="font-mono text-[10.5px] tracking-wide text-slate-light">CASE CLOSED</p>
          <h2 className="font-display text-[26px] font-semibold text-paper mt-0.5">Your Media Literacy Score</h2>
        </div>

        {demoMode && <DemoBanner reason={demoReason || "sample scorecard"} />}

        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center rounded-full w-24 h-24 border-[5px] border-amber bg-ink-soft">
            <span className="font-display text-[30px] font-bold text-paper">{overall}</span>
          </div>
          <p className="mt-2 font-mono text-[10.5px] text-slate-light">OVERALL</p>
        </div>

        <div className="rounded-2xl px-4 py-4 bg-paper">
          <ScoreBar label="Source Checking" value={scores.sourceChecking} colorClass="bg-teal-dark" />
          <ScoreBar label="Evidence Evaluation" value={scores.evidenceEvaluation} colorClass="bg-amber-dark" />
          <ScoreBar label="Manipulation Detection" value={scores.manipulationDetection} colorClass="bg-red-dark" />
        </div>

        {scores.summary && (
          <div className="mt-4 rounded-2xl px-4 py-3.5 flex items-start gap-2.5 bg-ink-soft border border-ink-line">
            <GraduationCap size={18} className="text-amber shrink-0 mt-0.5" />
            <p className="text-[12px] leading-relaxed text-slate-light">{scores.summary}</p>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 flex flex-col gap-2.5">
        <Button onClick={onNext} icon={ArrowRight}>Investigate Another Post</Button>
        <button onClick={onReplay} className="w-full flex items-center justify-center gap-1.5 py-1 font-mono text-[10.5px] text-slate-light hover:text-amber">
          <RotateCcw size={12} /> Start over
        </button>
      </div>
    </div>
  );
}