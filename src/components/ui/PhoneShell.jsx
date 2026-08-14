import React from "react";
import { Search, ChevronLeft } from "lucide-react";
import Stepper from "./Stepper.jsx";

export default function PhoneShell({ screen, caseLabel, canGoBack, onBack, children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-3 bg-[#0d1023] font-body">
      <div
        className="w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col bg-ink border border-ink-line"
        style={{ height: "min(880px, 94vh)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        {screen !== "home" && (
          <div>
            <div className="flex items-center gap-2.5 px-5 pt-5">
              {canGoBack ? (
                <button
                  onClick={onBack}
                  aria-label="Go back"
                  className="shrink-0 w-8 h-8 -ml-1 rounded-full flex items-center justify-center bg-ink-soft border border-ink-line text-slate-light hover:text-amber active:scale-95 transition-transform"
                >
                  <ChevronLeft size={18} />
                </button>
              ) : (
                <div className="w-8 h-8 shrink-0" />
              )}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Search size={16} className="text-amber shrink-0" strokeWidth={2.5} />
                <span className="font-mono text-[12.5px] tracking-widest text-slate-light truncate">TRUTHQUEST</span>
              </div>
              <span className="font-mono text-[11px] tracking-wide text-slate-light shrink-0">{caseLabel}</span>
            </div>
            <Stepper screen={screen} />
          </div>
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}