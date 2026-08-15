import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Paperclip, ArrowUp, X, FileText, Image as ImageIcon, ArrowRight, Mic } from "lucide-react";
import Button from "../ui/Button.jsx";
import DemoBanner from "../ui/DemoBanner.jsx";
import { sendChatMessage, fileToPart } from "../../lib/api.js";
import { DEMO_CHAT_REPLIES } from "../../data/demoFixtures.js";

const MAX_FILES = 3;

const QUICK_PROMPTS = [
  "Why should I doubt this?",
  "How can I verify the source?",
  "What manipulation signs should I watch?",
  "Explain this claim in simpler terms",
];

export default function Coach({ post, analysis, demoMode, history, setHistory, onContinue, scoreLoading, scoreError }) {
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const demoIdx = useRef(0);

  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ role: "assistant", text: analysis.summary || "Let's walk through what you found." }]);
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

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg && pendingFiles.length === 0) return;
    setLocalError(null);
    setError(null);
    const userMsg = { role: "user", text: msg, files: pendingFiles };
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
        const res = await sendChatMessage({ post, analysis, history: nextHistory, message: userMsg });
        setHistory((h) => [...h, { role: "assistant", text: res.reply, sources: res.sources || [] }]);
      }
    } catch (e) {
      console.error("Chat message failed:", e);
      setHistory((h) => [...h, { role: "assistant", text: "I couldn't reach the backend just now — try again.", sources: [] }]);
      setError("Message couldn't be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-mist">
      <div className="pointer-events-none select-none absolute top-10 -right-10 w-40 h-40 rounded-full bg-blue/10 blur-3xl" />

      <div className="relative flex items-center gap-3 px-5 pt-4 pb-2 bg-paper/90 backdrop-blur border-b border-paper-dim/60">
        <div className="relative flex items-center justify-center rounded-full w-[44px] h-[44px] bg-gradient-to-br from-blue to-navy shadow-md">
          <Sparkles size={20} className="text-white" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mint border-2 border-paper rounded-full" />
        </div>
        <div>
          <p className="font-body font-bold text-[16px] text-navy leading-tight">Scout</p>
          <p className="text-[12px] text-slate">Investigation coach · evidence first</p>
        </div>
        {demoMode && <div className="ml-auto"><DemoBanner /></div>}
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto no-scrollbar px-5 pt-3 flex flex-col gap-3 pb-2">
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm animate-pop ${
                m.role === "user"
                  ? "bg-navy text-white rounded-br-md"
                  : "bg-paper text-navy border border-paper-dim rounded-bl-md"
              }`}
              style={{ animationFillMode: "backwards", animationDelay: `${Math.min(i * 40, 200)}ms` }}
            >
              {m.text}
              {m.files?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.files.map((f, fi) => (
                    <span key={fi} className="flex items-center gap-1 text-[10.5px] bg-black/10 rounded-lg px-2 py-1">
                      {f.mimeType?.startsWith("image/") ? <ImageIcon size={11} /> : <FileText size={11} />} {f.name}
                    </span>
                  ))}
                </div>
              )}
              {m.sources?.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 border-t border-paper-dim pt-1.5">
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.url} target="_blank" rel="noreferrer" className="text-[10.5px] text-blue hover:underline truncate">
                      ↳ {s.title || s.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-paper border border-paper-dim rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1 shadow-sm">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-light animate-pulse" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {(error || localError) && (
        <div className="px-5 pb-1 text-[11px] text-rose font-medium">{error || localError}</div>
      )}

      {pendingFiles.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {pendingFiles.map((f, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] bg-blue-soft border border-paper-dim rounded-full pl-2 pr-1 py-1 text-slate font-medium">
              {f.mimeType?.startsWith("image/") ? <ImageIcon size={12} /> : <FileText size={12} />} {f.name}
              <button onClick={() => setPendingFiles((p) => p.filter((_, pi) => pi !== i))} className="hover:text-rose ml-0.5">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {history.length <= 1 && (
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={sending}
              className="shrink-0 rounded-full bg-paper border border-paper-dim px-3 py-1.5 text-[11.5px] font-semibold text-slate hover:text-blue hover:border-blue transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pb-3 flex items-center gap-2 bg-paper pt-3 border-t border-paper-dim/60">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={pendingFiles.length >= MAX_FILES}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-soft border border-paper-dim text-slate hover:text-blue disabled:opacity-40 transition-colors"
        >
          <Paperclip size={17} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask Scout anything…"
          className="flex-1 rounded-2xl bg-mist border border-paper-dim px-4 py-3 text-[14.5px] text-navy placeholder:text-slate-light outline-none focus:border-blue transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={sending || (!input.trim() && pendingFiles.length === 0)}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-navy text-white disabled:opacity-40 hover:shadow-md transition-all"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-5 pb-6 bg-paper">
        {scoreError && (
          <p className="mb-2 text-center text-[12px] leading-relaxed text-rose font-medium">{scoreError}</p>
        )}
        <Button
          onClick={onContinue}
          icon={ArrowRight}
          variant="navy"
          loading={scoreLoading}
          disabled={history.filter((h) => h.role === "user").length === 0}
          className={history.filter((h) => h.role === "user").length > 0 ? "shadow-lg" : ""}
        >
          {scoreError ? "Try Again" : "Get My Scorecard"}
        </Button>
      </div>
    </div>
  );
}
