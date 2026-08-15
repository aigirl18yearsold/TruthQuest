import React from "react";
import { ChevronLeft, Wifi, Battery, Signal } from "lucide-react";
import Stepper from "./Stepper.jsx";

export default function PhoneShell({ screen, caseLabel, canGoBack, onBack, children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-3 bg-gradient-to-b from-blue-soft to-mist font-body">
      <div
        className="w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col bg-mist border border-paper-dim/80"
        style={{
          height: "min(880px, 94vh)",
          boxShadow: "0 24px 50px -16px rgba(16,27,61,0.25), 0 0 0 1px rgba(255,255,255,0.35) inset",
        }}
      >
        {screen !== "home" && screen !== "principles" && (
          <div className="bg-paper/90 backdrop-blur border-b border-paper-dim/60">
            <div className="flex items-center gap-2.5 px-5 pt-5 pb-1">
              {canGoBack ? (
                <button
                  onClick={onBack}
                  aria-label="Go back"
                  className="shrink-0 w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-navy hover:bg-blue-soft active:scale-95 transition-all duration-200"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <div className="w-8 h-8 shrink-0" />
              )}
              <span className="font-body text-[16px] font-bold text-navy truncate tracking-tight">
                {caseLabel}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 pb-2 pt-0.5">
              <div className="text-[11px] font-medium text-slate-light">Case progress</div>
              <div className="flex items-center gap-1 text-slate-light">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={12} />
              </div>
            </div>
            <Stepper screen={screen} />
          </div>
        )}
        <div className="flex-1 min-h-0 relative">{children}</div>
      </div>
    </div>
  );
}
