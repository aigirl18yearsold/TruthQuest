import React from "react";
import { Search } from "lucide-react";
import Stepper from "./Stepper.jsx";

export default function PhoneShell({ screen, caseLabel, children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-3 bg-[#0d1023] font-body">
      <div
        className="w-full max-w-sm rounded-[2rem] overflow-hidden flex flex-col bg-ink border border-ink-line"
        style={{ height: "min(820px, 92vh)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
      >
        {screen !== "home" && (
          <div>
            <div className="flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-1.5">
                <Search size={14} className="text-amber" strokeWidth={2.5} />
                <span className="font-mono text-[11px] tracking-widest text-slate-light">TRUTHQUEST</span>
              </div>
              <span className="font-mono text-[10px] tracking-wide text-slate-light">{caseLabel}</span>
            </div>
            <Stepper screen={screen} />
          </div>
        )}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}