import React from "react";
import { ShieldCheck, Search, Flag, BadgeCheck, ExternalLink } from "lucide-react";
import DemoBanner from "../ui/DemoBanner.jsx";

function initials(name = "") {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

export default function PostReview({ post, demoMode, loading, onDecide }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-2 pb-3">
        <p className="text-[13px] text-slate-light leading-relaxed">
          Here's the real post. Read it the way you normally would in your feed.
        </p>
      </div>

      {demoMode && <DemoBanner reason="showing the sample case" />}

      <div className="mx-5 rounded-2xl overflow-hidden bg-cream border border-paper-dim">
        <div className="flex items-center gap-2.5 px-4 pt-4">
          <div className="rounded-full flex items-center justify-center w-[38px] h-[38px] bg-teal text-ink font-display font-bold">
            {initials(post.author)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-body font-bold text-[13.5px] text-ink truncate">{post.author}</span>
              {post.verified && <BadgeCheck size={13} className="text-blue-500 fill-blue-500 shrink-0" />}
            </div>
            <span className="font-mono text-[10.5px] text-slate truncate block">
              {post.handle || post.platform}
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wide text-slate-light shrink-0">{post.platform}</span>
        </div>

        <p className="px-4 pt-3 pb-3 font-body font-semibold text-[14.5px] text-ink leading-relaxed">
          {post.text || post.title || "(No caption text found for this post.)"}
        </p>

        {post.image ? (
          <img src={post.image} alt="" className="w-full max-h-[220px] object-cover" />
        ) : (
          <div className="mx-4 mb-3 rounded-xl h-[100px] flex items-center justify-center bg-gradient-to-br from-paper-dim to-[#DCD7C6]">
            <span className="font-mono text-[10px] text-slate tracking-wide">[ NO IMAGE PROVIDED ]</span>
          </div>
        )}

        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-4 pb-4 pt-1 font-mono text-[10.5px] text-slate hover:text-teal-dark border-t border-paper-dim mt-1"
        >
          <ExternalLink size={11} /> View original post
        </a>
      </div>

      <div className="mt-auto px-5 pt-5 pb-6">
        <p className="mb-3 text-center font-mono text-[10.5px] tracking-wide text-slate-light">
          WHAT'S YOUR FIRST CALL?
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onDecide("trust")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-teal text-ink active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <ShieldCheck size={16} /> Trust
          </button>
          <button
            onClick={() => onDecide("investigate")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-amber text-ink active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Search size={16} /> {loading ? "Analyzing…" : "Investigate"}
          </button>
          <button
            onClick={() => onDecide("dontTrust")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm bg-transparent text-red border-[1.5px] border-red active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Flag size={16} /> Don't Trust
          </button>
        </div>
      </div>
    </div>
  );
}