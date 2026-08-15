import React, { useState, useRef } from "react";
import { ClipboardPaste, ArrowRight, AlertTriangle, FlaskConical, Upload, Music, Video, X, Link as LinkIcon } from "lucide-react";
import Button from "../ui/Button.jsx";

const PLATFORMS = ["Instagram", "X / Twitter", "TikTok", "Facebook", "Threads", "YouTube", "Reddit", "Web articles"];
const MAX_MEDIA_BYTES = 14 * 1024 * 1024;

const PLATFORM_ICONS = {
  Instagram: "📷",
  "X / Twitter": "🐦",
  TikTok: "🎵",
  Facebook: "👥",
  Threads: "💬",
  YouTube: "▶️",
  Reddit: "🔗",
  "Web articles": "🌐",
};

export default function LinkEntry({ onLoad, onDemo, onUploadMedia, loading, error }) {
  const [mode, setMode] = useState("link");
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [pasted, setPasted] = useState(false);
  const fileInputRef = useRef(null);

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setValue(clip.trim());
        setPasted(true);
      }
    } catch {
      // continue
    }
  };

  const submitLink = () => {
    if (value.trim()) onLoad(value.trim());
  };

  const pickFile = (f) => {
    if (!f) return;
    setFileError(null);
    const isAudio = f.type.startsWith("audio/");
    const isVideo = f.type.startsWith("video/");
    if (!isAudio && !isVideo) {
      setFileError("Please choose an audio or video file.");
      return;
    }
    if (f.size > MAX_MEDIA_BYTES) {
      setFileError("That clip is too large — try one under ~14MB.");
      return;
    }
    setFile(f);
  };

  const submitUpload = () => {
    if (file) onUploadMedia(file);
  };

  return (
    <div className="relative flex flex-col h-full px-5 pt-5 pb-6 bg-mist">
      <div className="pointer-events-none select-none absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-soft/40 blur-3xl" />

      <div className="relative animate-fade-in">
        <h2 className="font-display text-[20px] font-extrabold text-navy tracking-tight">
          Bring in a real post
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">
          Drop a link, paste from your clipboard, or upload a short clip.
        </p>
      </div>

      <div className="relative mt-5 flex rounded-xl bg-paper border border-paper-dim p-1 shadow-sm">
        <button
          onClick={() => setMode("link")}
          className={`flex-1 rounded-lg py-2.5 font-body text-[13px] font-bold transition-all duration-200 ${
            mode === "link"
              ? "bg-navy text-white shadow-sm"
              : "text-slate hover:text-navy"
          }`}
        >
          Paste a link
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 rounded-lg py-2.5 font-body text-[13px] font-bold transition-all duration-200 ${
            mode === "upload"
              ? "bg-navy text-white shadow-sm"
              : "text-slate hover:text-navy"
          }`}
        >
          Upload audio/video
        </button>
      </div>

      {mode === "link" ? (
        <div className="relative mt-4 animate-slide-up" style={{ animationFillMode: "both" }}>
          <div className="relative rounded-xl border border-paper-dim focus-within:border-blue bg-paper flex items-center gap-2 px-3 py-3 shadow-sm transition-colors">
            <LinkIcon size={16} className="text-slate-light shrink-0" />
            <input
              value={value}
              onChange={(e) => { setValue(e.target.value); setPasted(false); }}
              onKeyDown={(e) => e.key === "Enter" && submitLink()}
              placeholder="https://..."
              className="flex-1 bg-transparent outline-none text-[14.5px] text-navy placeholder:text-slate-light font-medium"
            />
            <button
              onClick={handlePaste}
              className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${
                pasted ? "text-mint bg-mint-soft" : "text-slate-light hover:text-blue"
              }`}
            >
              Paste
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full bg-paper border border-paper-dim text-slate hover:border-blue hover:text-navy transition-colors"
              >
                {PLATFORM_ICONS[p] ?? ""} {p}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative mt-4 animate-slide-up" style={{ animationFillMode: "both" }}>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="audio/*,video/*"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-paper-dim bg-paper py-10 text-slate hover:border-blue hover:text-blue transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-blue-soft group-hover:scale-110 transition-transform flex items-center justify-center">
                <Upload size={22} className="text-blue" />
              </div>
              <span className="font-body text-[13px] font-bold">Tap to choose a file</span>
              <span className="text-[11.5px] text-slate-light">
                MP3, M4A, MP4, MOV — up to ~14MB
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-blue/30 bg-blue-soft px-4 py-3.5 shadow-sm">
              <div className="flex items-center justify-center rounded-lg w-10 h-10 bg-navy shrink-0">
                {file.type.startsWith("audio/") ? (
                  <Music size={16} className="text-white" />
                ) : (
                  <Video size={16} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[13px] font-bold text-navy truncate">{file.name}</p>
                <p className="text-[11px] text-slate">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-light hover:text-rose hover:bg-rose-soft transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {fileError && (
            <div className="mt-3 flex items-start gap-2 rounded-xl px-3.5 py-3 bg-rose-soft border border-rose/25 text-rose">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p className="text-[13px] leading-relaxed font-medium">{fileError}</p>
            </div>
          )}
          <p className="mt-3 text-[11.5px] leading-relaxed text-slate">
            Scout will listen/watch the clip, then investigate the claim.
          </p>
        </div>
      )}

      {error && (
        <div className="relative mt-3 flex items-start gap-2 rounded-xl px-3.5 py-3 bg-rose-soft border border-rose/25 text-rose animate-slide-up">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p className="text-[13px] leading-relaxed font-medium">{error}</p>
        </div>
      )}

      <div className="relative mt-auto flex flex-col gap-2.5 pt-7">
        {mode === "link" ? (
          <Button onClick={submitLink} icon={ArrowRight} disabled={!value.trim()} loading={loading}>
            {loading ? "Loading…" : "Load This Post"}
          </Button>
        ) : (
          <Button onClick={submitUpload} icon={ArrowRight} disabled={!file} loading={loading}>
            {loading ? "Loading clip…" : "Use This Clip"}
          </Button>
        )}
        <button
          onClick={onDemo}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[12.5px] font-bold text-slate hover:text-blue transition-colors"
        >
          <FlaskConical size={13} />
          Or try the sample case
        </button>
      </div>
    </div>
  );
}
