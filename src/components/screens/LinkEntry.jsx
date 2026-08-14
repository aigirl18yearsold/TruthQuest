import React, { useState } from "react";
import { ClipboardPaste, ArrowRight, AlertTriangle, FlaskConical } from "lucide-react";
import Button from "../ui/Button.jsx";

const PLATFORMS = ["Instagram", "X / Twitter", "TikTok", "Facebook", "Threads", "YouTube", "Reddit", "most public web pages"];

export default function LinkEntry({ onLoad, onDemo, loading, error }) {
  const [value, setValue] = useState("");

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setValue(clip.trim());
    } catch {
      // Clipboard permission denied — user can paste manually, no need to surface an error.
    }
  };

  const submit = () => {
    if (value.trim()) onLoad(value.trim());
  };

  return (
    <div className="flex flex-col h-full px-5 pt-2 pb-6">
      <h2 className="font-display text-[20px] font-semibold text-paper">Bring in a real post</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-light">
        Copy a public post link from any app and paste it below. We'll pull the real content —
        no login needed, and only public posts work (as with any legitimate embed).
      </p>

      <div className="mt-5 rounded-xl border border-ink-line focus-within:border-amber bg-ink-soft flex items-center gap-2 px-3 py-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="https://..."
          className="flex-1 bg-transparent outline-none text-[13px] text-paper placeholder:text-slate-light font-mono"
        />
        <button onClick={handlePaste} className="text-slate-light hover:text-amber shrink-0" aria-label="Paste from clipboard">
          <ClipboardPaste size={16} />
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5 bg-red/10 border border-red/30">
          <AlertTriangle size={14} className="text-red mt-0.5 shrink-0" />
          <p className="text-[12px] leading-relaxed text-red">{error}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => (
          <span key={p} className="font-mono text-[10px] px-2 py-1 rounded-full bg-ink-soft border border-ink-line text-slate-light">
            {p}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button onClick={submit} icon={ArrowRight} disabled={!value.trim()} loading={loading}>
          {loading ? "Loading post…" : "Load This Post"}
        </Button>
        <button
          onClick={onDemo}
          className="w-full flex items-center justify-center gap-1.5 py-2 font-mono text-[11px] text-slate-light hover:text-amber"
        >
          <FlaskConical size={12} /> Or try the sample case
        </button>
      </div>
    </div>
  );
}