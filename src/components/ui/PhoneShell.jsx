import React from "react";
import { ChevronLeft } from "lucide-react";
import Stepper from "./Stepper.jsx";

export default function PhoneShell({ screen, caseLabel, canGoBack, onBack, children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-3 bg-gradient-to-b from-blue-soft to-mist font-body">
      <div
        className="w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col bg-mist border border-paper-dim"
        style={{ height: "min(880px, 94vh)", boxShadow: "0 24px 50px -16px rgba(16,27,61,0.25)" }}
      >
        {screen !== "home" && (
          <div className="bg-paper">
            <div className="flex items-center gap-2.5 px-5 pt-5 pb-1">
              {canGoBack ? (
                <button
                  onClick={onBack}
                  aria-label="Go back"
                  className="shrink-0 w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-navy hover:bg-blue-soft active:scale-95 transition-transform"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <div className="w-8 h-8 shrink-0" />
              )}
              <span className="font-body text-[16px] font-bold text-navy truncate">{caseLabel}</span>
            </div>
            <Stepper screen={screen} />
          </div>
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}