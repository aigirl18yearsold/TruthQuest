import React from "react";
import { ShieldCheck, Search, Flag, BadgeCheck, ExternalLink, Music, Video, AlertTriangle, Eye } from "lucide-react";
import DemoBanner from "../ui/DemoBanner.jsx";

function initials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

const CLAIM_BADGE_COLORS = [
  "bg-blue-soft text-blue border-blue/20",
  "bg-amber-soft text-amber border-amber/20",
  "bg-rose-soft text-rose border-rose/20",
  "bg-mint-soft text-mint border-mint/20",
];

export default function PostReview({ post, demoMode, loading, error, onDecide }) {
  const isUpload = post.source === "upload";

  return (
    <div className="relative flex flex-col h-full bg-mist">
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-blue-soft/40 blur-3xl pointer-events-none select-none" />

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-4 pb-3">
          <p className="text-[14.5px] text-slate leading-relaxed">
            {isUpload
              ? "Here's the clip you uploaded."
              : "Read it the way you normally would in your feed."}
          </p>
        </div>

        {demoMode && <DemoBanner />}

        <div className="mx-5 mb-4 rounded-2xl overflow-hidden bg-paper border border-paper-dim shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <div className="rounded-full flex items-center justify-center w-[43px] h-[43px] bg-navy text-white font-display font-bold shrink-0 shadow-sm">
              {isUpload ? (
                post.mediaType === "audio" ? <Music size={18} /> : <Video size={18} />
              ) : (
                initials(post.author)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-body font-bold text-[15px] text-navy truncate">{post.author}</span>
                {post.verified && (
                  <BadgeCheck size={15} className="text-blue fill-blue shrink-0" />
                )}
              </div>
              <span className="text-[12px] text-slate truncate block">
                {post.handle || post.platform}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-light bg-blue-soft px-2 py-1 rounded-full shrink-0">
              {post.platform}
            </span>
          </div>

          <div className="mt-3 mx-4 flex items-start gap-2">
            <Eye size={16} className="text-slate-light mt-0.5 shrink-0" />
            <p className="text-[11px] font-semibold text-slate-light uppercase tracking-wider">
              Review before you react
            </p>
          </div>

          <p className="px-4 pt-3 pb-3 font-body font-semibold text-[16px] text-navy leading-relaxed whitespace-pre-wrap">
            {post.text || post.title || "(No caption text found for this post.)"}
          </p>

          {post.image ? (
            <img src={post.image} alt="" className="w-full max-h-[246px] object-cover" />
          ) : isUpload ? (
            <div className="mx-4 mb-3 rounded-xl h-[112px] flex flex-col items-center justify-center gap-1.5 bg-blue-soft border border-blue/10">
              {post.mediaType === "audio" ? (
                <Music size={22} className="text-blue" />
              ) : (
                <Video size={22} className="text-blue" />
              )}
              <span className="text-[10.5px] text-slate tracking-wide font-medium">
                {post.mediaType === "audio" ? "AUDIO CLIP" : "VIDEO CLIP"} — no preview frame
              </span>
            </div>
          ) : (
            <div className="mx-4 mb-3 rounded-xl h-[112px] flex items-center justify-center bg-blue-soft border border-blue/10">
              <span className="text-[11px] text-slate tracking-wide font-medium">No image provided</span>
            </div>
          )}

          {!isUpload && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 pb-4 pt-1 text-[12px] font-semibold text-blue hover:text-navy border-t border-paper-dim mt-1 transition-colors"
            >
              <ExternalLink size={12} />
              View original post
            </a>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-6 border-t border-paper-dim bg-paper shrink-0">
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-xl px-3.5 py-3 bg-rose-soft border border-rose/25 text-rose">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="text-[13px] leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-paper-dim" />
          <p className="text-[12px] font-bold text-slate uppercase tracking-wider">Your first call</p>
          <div className="h-px flex-1 bg-paper-dim" />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onDecide("trust")}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm bg-mint-soft text-mint border border-mint/20 active:scale-[0.98] transition-all hover:shadow-md disabled:opacity-50"
          >
            <div className="w-7 h-7 rounded-full bg-mint/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={16} />
            </div>
            Trust
          </button>
          <button
            onClick={() => onDecide("investigate")}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm bg-amber-soft text-amber border border-amber/25 active:scale-[0.98] transition-all hover:shadow-md disabled:opacity-50"
          >
            <div className="w-7 h-7 rounded-full bg-amber/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search size={16} />
            </div>
            {loading ? "Analyzing…" : "Investigate"}
          </button>
          <button
            onClick={() => onDecide("dontTrust")}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm bg-rose-soft text-rose border border-rose/25 active:scale-[0.98] transition-all hover:shadow-md disabled:opacity-50"
          >
            <div className="w-7 h-7 rounded-full bg-rose/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flag size={16} />
            </div>
            Don't Trust
          </button>
        </div>
      </div>
    </div>
  );
}
