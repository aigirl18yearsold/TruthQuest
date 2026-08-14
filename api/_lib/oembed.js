import { detectPlatform } from "./platform.js";

const UA =
  "Mozilla/5.0 (compatible; TruthQuestBot/1.0; +https://github.com/) media-literacy-prototype";

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
  return res.text();
}

function metaTag(html, prop) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const m = html.match(re) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`, "i"));
  return m ? decodeHtml(m[1]) : null;
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Fallback used for any platform without a public oEmbed endpoint (or as a last resort):
 * reads the page's public Open Graph / Twitter Card meta tags. This is the same public
 * metadata every link-preview feature (iMessage, Slack, Discord…) already relies on. */
async function fromOpenGraph(url, platformLabel) {
  const html = await getText(url);
  const title = metaTag(html, "og:title") || metaTag(html, "twitter:title");
  const description = metaTag(html, "og:description") || metaTag(html, "twitter:description");
  const image = metaTag(html, "og:image") || metaTag(html, "twitter:image");
  const siteName = metaTag(html, "og:site_name");
  const author = metaTag(html, "og:site_name") || metaTag(html, "article:author");

  if (!title && !description) {
    throw new Error("Couldn't read a public preview for this link. It may be private, deleted, or the platform blocks previews.");
  }

  return {
    platform: platformLabel || siteName || "web",
    author: author || siteName || "Unknown source",
    handle: null,
    avatar: null,
    text: description || title || "",
    title: title || null,
    image: image || null,
    publishedAt: null,
    permalink: url,
    verified: false,
    source: "opengraph",
  };
}

async function fromInstagramFamily(url, label) {
  // Public content is tokenless as of June 2026 (Meta oEmbed policy change).
  const endpoint = `https://graph.facebook.com/v25.0/${label === "instagram" ? "instagram_oembed" : "oembed_post"}?url=${encodeURIComponent(url)}`;
  try {
    const data = await getJson(endpoint);
    return {
      platform: label,
      author: data.author_name || label,
      handle: data.author_name ? `@${data.author_name}` : null,
      avatar: null,
      text: stripHtml(data.title || ""),
      title: null,
      image: data.thumbnail_url || null,
      publishedAt: null,
      permalink: url,
      verified: false,
      source: "oembed",
    };
  } catch {
    // Private post, rate-limited, or a URL shape oEmbed doesn't recognize (e.g. a profile).
    return fromOpenGraph(url, label);
  }
}

async function fromTwitter(url) {
  const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
  const data = await getJson(endpoint);
  return {
    platform: "twitter",
    author: data.author_name || "Unknown",
    handle: data.author_url ? `@${data.author_url.split("/").pop()}` : null,
    avatar: null,
    text: stripHtml(data.html || ""),
    title: null,
    image: null,
    publishedAt: null,
    permalink: url,
    verified: false,
    source: "oembed",
  };
}

async function fromTikTok(url) {
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
  const data = await getJson(endpoint);
  return {
    platform: "tiktok",
    author: data.author_name || "Unknown",
    handle: data.author_url ? `@${data.author_url.split("/").pop()}` : null,
    avatar: null,
    text: data.title || "",
    title: null,
    image: data.thumbnail_url || null,
    publishedAt: null,
    permalink: url,
    verified: false,
    source: "oembed",
  };
}

async function fromYouTube(url) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const data = await getJson(endpoint);
  return {
    platform: "youtube",
    author: data.author_name || "Unknown",
    handle: null,
    avatar: null,
    text: data.title || "",
    title: data.title || null,
    image: data.thumbnail_url || null,
    publishedAt: null,
    permalink: url,
    verified: false,
    source: "oembed",
  };
}

async function fromReddit(url) {
  const endpoint = `https://www.reddit.com/oembed?url=${encodeURIComponent(url)}`;
  const data = await getJson(endpoint);
  return {
    platform: "reddit",
    author: data.author_name || "Unknown",
    handle: null,
    avatar: null,
    text: stripHtml(data.html || data.title || ""),
    title: data.title || null,
    image: data.thumbnail_url || null,
    publishedAt: null,
    permalink: url,
    verified: false,
    source: "oembed",
  };
}

/** Fetch and normalize a real post from a pasted URL. Throws a user-readable Error on failure. */
export async function fetchNormalizedPost(url) {
  const platform = detectPlatform(url);
  if (!platform) throw new Error("That doesn't look like a valid link.");

  switch (platform) {
    case "instagram":
    case "threads":
    case "facebook":
      return fromInstagramFamily(url, platform);
    case "twitter":
      return fromTwitter(url).catch(() => fromOpenGraph(url, "twitter"));
    case "tiktok":
      return fromTikTok(url).catch(() => fromOpenGraph(url, "tiktok"));
    case "youtube":
      return fromYouTube(url).catch(() => fromOpenGraph(url, "youtube"));
    case "reddit":
      return fromReddit(url).catch(() => fromOpenGraph(url, "reddit"));
    default:
      return fromOpenGraph(url, "web");
  }
}