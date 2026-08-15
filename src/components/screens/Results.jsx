import React from "react";
import { GraduationCap, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
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

export default function Results({ scores, demoMode, onNext, onReplay }) {
  const overall = clamp((scores.sourceChecking + scores.evidenceEvaluation + scores.manipulationDetection) / 3);

  return (
    <div className="flex flex-col h-full bg-mist">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
        <div className="text-center mb-4">
          <p className="text-[12px] font-semibold text-slate">Case closed</p>
          <h2 className="font-display text-[22px] font-extrabold text-navy mt-0.5">Your Media Literacy Score</h2>
        </div>

        {demoMode && <DemoBanner />}

        <div className="rounded-2xl bg-navy px-5 py-6 flex flex-col items-center">
          <p className="text-[13px] font-semibold text-white/80 mb-1">Overall score</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[46px] font-extrabold text-mint leading-none">{overall}</span>
            <span className="text-[15px] font-semibold text-white/60">/100</span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
            <Sparkles size={13} className="text-mint" /> {tierFor(overall)}
          </span>
        </div>

        <div className="mt-4 rounded-2xl px-4 py-4 bg-paper border border-paper-dim">
          <ScoreBar label="Source Checking" value={scores.sourceChecking} colorClass="bg-blue" />
          <ScoreBar label="Evidence Evaluation" value={scores.evidenceEvaluation} colorClass="bg-amber" />
          <ScoreBar label="Manipulation Detection" value={scores.manipulationDetection} colorClass="bg-rose" />
        </div>

        {scores.summary && (
          <div className="mt-4 rounded-2xl px-4 py-3.5 flex items-start gap-2.5 bg-blue-soft">
            <GraduationCap size={18} className="text-blue shrink-0 mt-0.5" />
            <p className="text-[12.5px] leading-relaxed text-slate">{scores.summary}</p>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-6 flex flex-col gap-2.5 bg-paper border-t border-paper-dim">
        <Button onClick={onNext} icon={ArrowRight} variant="blue">Investigate Another Post</Button>
        <button onClick={onReplay} className="w-full flex items-center justify-center gap-1.5 py-1 text-[11.5px] font-medium text-slate hover:text-blue">
          <RotateCcw size={12} /> Start over
        </button>
      </div>
    </div>
  );
}