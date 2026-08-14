import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Paperclip, ArrowUp, X, FileText, Image as ImageIcon, ArrowRight } from "lucide-react";
import Button from "../ui/Button.jsx";
import DemoBanner from "../ui/DemoBanner.jsx";
import { sendChatMessage, fileToPart } from "../../lib/api.js";
import { DEMO_CHAT_REPLIES } from "../../data/demoFixtures.js";

const MAX_FILES = 3;

export default function Coach({ post, analysis, demoMode, history, setHistory, onContinue, scoreLoading, scoreError }) {
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const demoIdx = useRef(0);

  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ role: "assistant", text: analysis.summary || "Let's talk through what you found." }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, sending]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).slice(0, MAX_FILES - pendingFiles.length);
    for (const f of files) {
      if (f.size > 8 * 1024 * 1024) {
        setError(`"${f.name}" is too large (max 8MB).`);
        continue;
      }
      try {
        const part = await fileToPart(f);
        setPendingFiles((p) => [...p, part]);
      } catch {
        setError(`Couldn't read "${f.name}".`);
      }
    }
  };

  const send = async () => {
    if (!input.trim() && pendingFiles.length === 0) return;
    setError(null);
    const userMsg = { role: "user", text: input.trim(), files: pendingFiles };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInput("");
    setPendingFiles([]);
    setSending(true);

    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 700));
        const reply = DEMO_CHAT_REPLIES[demoIdx.current % DEMO_CHAT_REPLIES.length];
        demoIdx.current += 1;
        setHistory((h) => [...h, { role: "assistant", text: reply, sources: [] }]);
      } else {
        const res = await sendChatMessage({ post, analysis, history, message: userMsg });
        setHistory((h) => [...h, { role: "assistant", text: res.reply, sources: res.sources || [] }]);
      }
    } catch (e) {
      console.error("Chat message failed:", e);
      setHistory((h) => [...h, { role: "assistant", text: "I couldn't reach the AI backend just now — try again in a moment.", sources: [] }]);
      setError("Message couldn't be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-1 pb-2 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-full w-[38px] h-[38px] bg-amber shrink-0">
          <Sparkles size={19} className="text-ink" />
        </div>
        <div>
          <p className="font-body font-bold text-[16px] text-paper leading-tight">Scout</p>
          <p className="font-mono text-[12px] text-slate-light">your investigation coach · live search</p>
        </div>
      </div>

      {demoMode && <DemoBanner />}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 pb-2">
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
                m.role === "user" ? "bg-amber text-ink rounded-br-sm" : "bg-ink-soft text-paper border border-ink-line rounded-bl-sm"
              }`}
            >
              {m.text}
              {m.files?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.files.map((f, fi) => (
                    <span key={fi} className="flex items-center gap-1 font-mono text-[10.5px] bg-black/10 rounded px-1.5 py-0.5">
                      {f.mimeType?.startsWith("image/") ? <ImageIcon size={11} /> : <FileText size={11} />} {f.name}
                    </span>
                  ))}
                </div>
              )}
              {m.sources?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 border-t border-ink-line/50 pt-1.5">
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.url} target="_blank" rel="noreferrer" className="font-mono text-[10.5px] text-teal hover:underline truncate">
                      ↳ {s.title || s.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-ink-soft border border-ink-line rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-light animate-pulse" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="px-5 pb-1 font-mono text-[11px] text-red">{error}</p>}

      {pendingFiles.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {pendingFiles.map((f, i) => (
            <span key={i} className="flex items-center gap-1 font-mono text-[11px] bg-ink-soft border border-ink-line rounded-full pl-2 pr-1 py-1 text-slate-light">
              {f.mimeType?.startsWith("image/") ? <ImageIcon size={12} /> : <FileText size={12} />} {f.name}
              <button onClick={() => setPendingFiles((p) => p.filter((_, pi) => pi !== i))} className="hover:text-red">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="px-5 pb-3 flex items-center gap-2">
        <input ref={fileInputRef} type="file" hidden multiple accept="image/*,.pdf,.txt" onChange={(e) => handleFiles(e.target.files)} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={pendingFiles.length >= MAX_FILES}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-ink-soft border border-ink-line text-slate-light hover:text-amber disabled:opacity-40"
        >
          <Paperclip size={17} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask the coach anything…"
          className="flex-1 rounded-full bg-ink-soft border border-ink-line px-4 py-2.5 text-[14.5px] text-paper placeholder:text-slate-light outline-none focus:border-amber"
        />
        <button
          onClick={send}
          disabled={sending || (!input.trim() && pendingFiles.length === 0)}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-amber text-ink disabled:opacity-40"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-5 pb-6">
        {scoreError && (
          <p className="mb-2 text-center text-[12px] leading-relaxed text-red">{scoreError}</p>
        )}
        <Button
          onClick={onContinue}
          icon={ArrowRight}
          variant="dark"
          loading={scoreLoading}
          disabled={history.filter((h) => h.role === "user").length === 0}
        >
          {scoreError ? "Try Again" : "Get My Scorecard"}
        </Button>
      </div>
    </div>
  );
}