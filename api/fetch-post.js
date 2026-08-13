import { fetchNormalizedPost } from "./_lib/oembed.js";
import { isPlausibleUrl } from "./_lib/platform.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  const { url } = req.body || {};
  if (!url || !isPlausibleUrl(url)) {
    res.status(400).json({ error: "Paste a valid post link (starting with http:// or https://)." });
    return;
  }

  try {
    const post = await fetchNormalizedPost(url);
    res.status(200).json({ post });
  } catch (err) {
    res.status(422).json({ error: err.message || "Couldn't load that link." });
  }
}