import React, { useState, useRef } from "react";
import { ClipboardPaste, ArrowRight, AlertTriangle, FlaskConical, Upload, Music, Video, X } from "lucide-react";
import Button from "../ui/Button.jsx";

const PLATFORMS = ["Instagram", "X / Twitter", "TikTok", "Facebook", "Threads", "YouTube", "Reddit", "most public web pages"];
const MAX_MEDIA_BYTES = 14 * 1024 * 1024; // keep clips short — see api/analyze.js for the matching server-side cap

export default function LinkEntry({ onLoad, onDemo, onUploadMedia, loading, error }) {
  const [mode, setMode] = useState("link"); // "link" | "upload"
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setValue(clip.trim());
    } catch {
      // Clipboard permission denied — user can paste manually, no need to surface an error.
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
      setFileError("That clip is too large — try one under about 14MB (a short voice note or clip works best).");
      return;
    }
    setFile(f);
  };

  const submitUpload = () => {
    if (file) onUploadMedia(file);
  };

  return (
    <div className="flex flex-col h-full px-5 pt-2 pb-6">
      <h2 className="font-display text-[22.5px] font-semibold text-paper">Bring in a real post</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-slate-light">
        Paste a public post link, or upload a clip someone sent you directly.
      </p>

      <div className="mt-4 flex rounded-xl bg-ink-soft border border-ink-line p-1">
        <button
          onClick={() => setMode("link")}
          className={`flex-1 rounded-lg py-2 font-body text-[13px] font-semibold transition-colors ${
            mode === "link" ? "bg-amber text-ink" : "text-slate-light"
          }`}
        >
          Paste a link
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex-1 rounded-lg py-2 font-body text-[13px] font-semibold transition-colors ${
            mode === "upload" ? "bg-amber text-ink" : "text-slate-light"
          }`}
        >
          Upload audio/video
        </button>
      </div>

      {mode === "link" ? (
        <>
          <div className="mt-4 rounded-xl border border-ink-line focus-within:border-amber bg-ink-soft flex items-center gap-2 px-3 py-3">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitLink()}
              placeholder="https://..."
              className="flex-1 bg-transparent outline-none text-[14.5px] text-paper placeholder:text-slate-light font-mono"
            />
            <button onClick={handlePaste} className="text-slate-light hover:text-amber shrink-0" aria-label="Paste from clipboard">
              <ClipboardPaste size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <span key={p} className="font-mono text-[11px] px-2 py-1 rounded-full bg-ink-soft border border-ink-line text-slate-light">
                {p}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4">
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
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-line py-8 text-slate-light hover:border-amber hover:text-amber transition-colors"
            >
              <Upload size={22} />
              <span className="font-body text-[13px] font-semibold">Tap to choose a file</span>
              <span className="font-mono text-[10.5px]">MP3, M4A, MP4, MOV — up to ~14MB</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-amber/35 bg-ink-soft px-4 py-3.5">
              <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-amber shrink-0">
                {file.type.startsWith("audio/") ? <Music size={16} className="text-ink" /> : <Video size={16} className="text-ink" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[13px] font-semibold text-paper truncate">{file.name}</p>
                <p className="font-mono text-[10.5px] text-slate-light">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-slate-light hover:text-red shrink-0">
                <X size={16} />
              </button>
            </div>
          )}
          {fileError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5 bg-red/10 border border-red/30">
              <AlertTriangle size={16} className="text-red mt-0.5 shrink-0" />
              <p className="text-[13.5px] leading-relaxed text-red">{fileError}</p>
            </div>
          )}
          <p className="mt-3 text-[11.5px] leading-relaxed text-slate-light">
            Scout will listen to or watch the clip to find the claim being made, then investigate it —
            best for short, focused clips rather than long recordings.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5 bg-red/10 border border-red/30">
          <AlertTriangle size={16} className="text-red mt-0.5 shrink-0" />
          <p className="text-[13.5px] leading-relaxed text-red">{error}</p>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        {mode === "link" ? (
          <Button onClick={submitLink} icon={ArrowRight} disabled={!value.trim()} loading={loading}>
            {loading ? "Loading post…" : "Load This Post"}
          </Button>
        ) : (
          <Button onClick={submitUpload} icon={ArrowRight} disabled={!file} loading={loading}>
            {loading ? "Loading clip…" : "Use This Clip"}
          </Button>
        )}
        <button
          onClick={onDemo}
          className="w-full flex items-center justify-center gap-1.5 py-2 font-mono text-[12.5px] text-slate-light hover:text-amber"
        >
          <FlaskConical size={13} /> Or try the sample case
        </button>
      </div>
    </div>
  );
}