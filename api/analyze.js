import { groundedGenerate, parseJsonLoose } from "./_lib/gemini.js";

const CLUE_QUESTIONS = [
  { id: "publisher", q: "Who published it?" },
  { id: "source", q: "Is there an original source?" },
  { id: "evidence", q: "Is evidence provided?" },
  { id: "statistic", q: "Is the statistic or central claim supported?" },
  { id: "language", q: "Is the language emotionally manipulative?" },
  { id: "crosscheck", q: "Can other reliable sources confirm it?" },
];

const SYSTEM = `You are Scout, the investigation engine inside TruthQuest, a media-literacy app that
teaches people to evaluate social media posts critically. You are NOT a fact-checking verdict
machine — you are gathering evidence for a human investigator (the player) to reason about themselves.

Some posts arrive as an attached audio or video clip instead of text. In that case, first listen to
or watch the clip to identify the core claim being made, as if you were transcribing what a viewer
would take away from it, then investigate that claim exactly as you would a text post.

Some posts have no caption text at all — this is normal for many video posts. When that happens and
an image is attached, look at the image directly: read any on-screen text, judge what the post is
actually showing or claiming, and investigate that instead of treating the absence of a caption as
itself suspicious.

Use Google Search to actually check: who the publisher/account is, whether an original source or
study exists, whether independent reliable outlets report the same claim, and whether the
language uses urgency/fear/exaggeration.

Respond with ONLY a JSON object, no prose outside it, matching exactly this shape:
{
  "clues": [
    { "id": "publisher", "finding": "1-2 sentence factual finding, plain language" },
    { "id": "source", "finding": "..." },
    { "id": "evidence", "finding": "..." },
    { "id": "statistic", "finding": "..." },
    { "id": "language", "finding": "..." },
    { "id": "crosscheck", "finding": "..." }
  ],
  "verdict": "credible" | "misleading" | "unverified",
  "confidence": 0-100,
  "summary": "2-3 sentence coach-voice opening for a follow-up conversation with the player. Do not just say true/false — invite them to think, e.g. point at the specific gap between the claim and the evidence."
}`;

const MAX_MEDIA_BYTES = 14 * 1024 * 1024; // stays safely under Gemini's ~20MB inline request limit
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Best-effort: pull a post's preview image server-side and hand it to Gemini as real pixels,
 * not just a URL. Never throws — returns null on any failure so analysis can proceed without it. */
async function fetchImageAsInlineData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") || "").split(";")[0];
    if (!contentType.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_IMAGE_BYTES) return null;
    return { mimeType: contentType, data: Buffer.from(buf).toString("base64") };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  const { post } = req.body || {};
  const hasMedia = !!post?.mediaFile?.data;
  // Only fail if there's truly nothing to investigate. A missing caption alone is common and
  // fine — the post's image, account, and link are still enough for Scout to work with.
  const hasAnyContent = post && (post.text || post.title || post.image || post.permalink || hasMedia);
  if (!hasAnyContent) {
    res.status(400).json({ error: "There's nothing here for Scout to investigate yet." });
    return;
  }

  if (hasMedia) {
    const approxBytes = post.mediaFile.data.length * 0.75;
    if (approxBytes > MAX_MEDIA_BYTES) {
      res.status(413).json({ error: "That clip is too large to analyze directly — try a shorter clip (under ~14MB)." });
      return;
    }
  }

  const captionLine = post?.text
    ? `Post text / caption: """${post.text}"""`
    : `Post text / caption: (none found — this post has no caption. If an image is attached below, look at it directly.)`;

  const promptText = hasMedia
    ? `Investigate the attached ${post.mediaType || "media"} clip (filename: "${post.mediaFile.name}").
It was uploaded directly by the player rather than linked from a platform, so there's no
publisher account or original URL — note that honestly in the "publisher" and "source" findings
instead of guessing one. Identify the core claim made in the clip, then investigate it: search for
where this claim originates, whether it's been reported by reliable outlets, and whether the
language used is emotionally manipulative.

Answer the six clue questions, then give your overall verdict and confidence, following the JSON
schema exactly.`
    : `Investigate this social media post.

Platform: ${post.platform}
Author / account: ${post.author}${post.handle ? ` (${post.handle})` : ""}
${captionLine}
Original link: ${post.permalink || "(not available)"}

Answer the six clue questions, then give your overall verdict and confidence, following the JSON
schema exactly. If you can't verify something even after searching, say so honestly in that
clue's finding instead of guessing.`;

  const parts = [{ text: promptText }];
  if (hasMedia) {
    parts.push({ inlineData: { mimeType: post.mediaFile.mimeType, data: post.mediaFile.data } });
  } else if (post.image) {
    const imagePart = await fetchImageAsInlineData(post.image);
    if (imagePart) parts.push({ inlineData: imagePart });
  }

  try {
    const { text, sources } = await groundedGenerate({
      systemInstruction: SYSTEM,
      contents: [{ role: "user", parts }],
      json: true,
    });
    const parsed = parseJsonLoose(text);

    // Merge in the question text so the frontend doesn't need to duplicate it.
    const clues = CLUE_QUESTIONS.map((c) => {
      const found = parsed.clues?.find((x) => x.id === c.id);
      return { id: c.id, question: c.q, finding: found?.finding || "No finding returned." };
    });

    res.status(200).json({
      clues,
      verdict: parsed.verdict || "unverified",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
      summary: parsed.summary || "",
      sources,
    });
  } catch (err) {
    const status = err.code === "NO_API_KEY" ? 501 : 502;
    res.status(status).json({ error: err.message || "Analysis failed." });
  }
}