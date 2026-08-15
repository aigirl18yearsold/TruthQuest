import React from "react";
import { ShieldCheck, Search, Flag, BadgeCheck, ExternalLink, Music, Video, AlertTriangle } from "lucide-react";
import DemoBanner from "../ui/DemoBanner.jsx";

function initials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

export default function PostReview({ post, demoMode, loading, error, onDecide }) {
  const isUpload = post.source === "upload";

  return (
    <div className="flex flex-col h-full bg-mist">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 pb-3">
          <p className="text-[14.5px] text-slate leading-relaxed">
            {isUpload
              ? "Here's the clip you uploaded."
              : "Here's the real post. Read it the way you normally would in your feed."}
          </p>
        </div>

        {demoMode && <DemoBanner />}

        <div className="mx-5 mb-4 rounded-2xl overflow-hidden bg-paper border border-paper-dim">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <div className="rounded-full flex items-center justify-center w-[43px] h-[43px] bg-blue text-white font-display font-bold shrink-0">
              {isUpload ? (post.mediaType === "audio" ? <Music size={18} /> : <Video size={18} />) : initials(post.author)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-body font-bold text-[15px] text-navy truncate">{post.author}</span>
                {post.verified && <BadgeCheck size={15} className="text-blue fill-blue shrink-0" />}
              </div>
              <span className="text-[12px] text-slate truncate block">
                {post.handle || post.platform}
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-light shrink-0">{post.platform}</span>
          </div>

          <p className="px-4 pt-3 pb-3 font-body font-semibold text-[16px] text-navy leading-relaxed whitespace-pre-wrap">
            {post.text || post.title || "(No caption text found for this post.)"}
          </p>

          {post.image ? (
            isUpload ? (
              <img src={post.image} alt="" className="w-full max-h-[246px] object-cover" />
            ) : (
              <a href={post.permalink} target="_blank" rel="noreferrer" className="relative block group">
                <img src={post.image} alt="" className="w-full max-h-[246px] object-cover" />
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[10.5px] font-semibold text-white group-hover:bg-navy">
                  <ExternalLink size={10} /> View on {post.platform}
                </span>
              </a>
            )
          ) : isUpload ? (
            <div className="mx-4 mb-3 rounded-xl h-[112px] flex flex-col items-center justify-center gap-1.5 bg-blue-soft">
              {post.mediaType === "audio" ? <Music size={22} className="text-blue" /> : <Video size={22} className="text-blue" />}
              <span className="text-[10.5px] text-slate tracking-wide">
                {post.mediaType === "audio" ? "AUDIO CLIP" : "VIDEO CLIP"} — no preview frame available
              </span>
            </div>
          ) : (
            <div className="mx-4 mb-3 rounded-xl h-[112px] flex items-center justify-center bg-blue-soft">
              <span className="text-[11px] text-slate tracking-wide">No image provided</span>
            </div>
          )}

          {!isUpload && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 pb-4 pt-1 text-[12px] font-medium text-slate hover:text-blue border-t border-paper-dim mt-1"
            >
              <ExternalLink size={12} /> View original post
            </a>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-6 border-t border-paper-dim bg-paper shrink-0">
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg px-3 py-2.5 bg-rose-soft border border-rose/25">
            <AlertTriangle size={16} className="text-rose mt-0.5 shrink-0" />
            <p className="text-[13px] leading-relaxed text-rose">{error}</p>
          </div>
        )}
        <p className="mb-3 text-center text-[12.5px] font-semibold text-slate">
          What's your first call?
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onDecide("trust")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-mint-soft text-mint border border-mint/20 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <ShieldCheck size={18} /> Trust
          </button>
          <button
            onClick={() => onDecide("investigate")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-amber-soft text-amber border border-amber/25 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Search size={18} /> {loading ? "Analyzing…" : "Investigate"}
          </button>
          <button
            onClick={() => onDecide("dontTrust")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-rose-soft text-rose border border-rose/25 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Flag size={18} /> Don't Trust
          </button>
        </div>
      </div>
    </div>
  );
}