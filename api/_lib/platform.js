/**
 * Identify which platform a pasted URL belongs to, so we know which
 * public oEmbed endpoint (or fallback) to use to fetch real post data.
 */
export function detectPlatform(rawUrl) {
  let host;
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }

  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("threads.net")) return "threads";
  if (host.includes("facebook.com") || host.includes("fb.watch")) return "facebook";
  if (host.includes("twitter.com") || host === "x.com") return "twitter";
  if (host.includes("tiktok.com")) return "tiktok";
  if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
  if (host.includes("reddit.com") || host === "redd.it") return "reddit";
  return "generic";
}

export function isPlausibleUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}