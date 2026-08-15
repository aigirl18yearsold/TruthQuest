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

Some posts have no caption text at all — this is completely normal for many video and image posts.
NEVER reject a post simply because its caption is missing.

When there is no caption:
- For video/audio, watch or listen to the attached media and identify the main claim or message.
- For images, inspect the image directly and read any visible text.
- Use whatever information is actually available in the post.
- Do not treat a missing caption as evidence that the post is misleading.

Use Google Search to actually check: who the publisher/account is, whether an original source or
study exists, whether independent reliable outlets report the same claim, and whether the language
uses urgency/fear/exaggeration.

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

const MAX_MEDIA_BYTES = 14 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Best-effort: pull a post's preview image server-side and hand it to Gemini as real pixels. */
async function fetchImageAsInlineData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") || "").split(";")[0];

    if (!contentType.startsWith("image/")) return null;

    const buf = await res.arrayBuffer();

    if (buf.byteLength > MAX_IMAGE_BYTES) return null;

    return {
      mimeType: contentType,
      data: Buffer.from(buf).toString("base64"),
    };
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

  // A caption is NOT required.
  // Any of these can give Scout something to investigate.
  const hasAnyContent =
    post &&
    (
      post.text ||
      post.title ||
      post.image ||
      post.permalink ||
      post.author ||
      post.handle ||
      post.platform ||
      hasMedia
    );

  if (!hasAnyContent) {
    res.status(400).json({
      error: "There's nothing here for Scout to investigate yet.",
    });
    return;
  }

  if (hasMedia) {
    const approxBytes = post.mediaFile.data.length * 0.75;

    if (approxBytes > MAX_MEDIA_BYTES) {
      res.status(413).json({
        error:
          "That clip is too large to analyze directly — try a shorter clip (under ~14MB).",
      });
      return;
    }
  }

  const captionLine = post?.text
    ? `Post text / caption: """${post.text}"""`
    : `Post text / caption: (none found — this post has no caption. This is normal. Analyze the attached media or other available post information instead.)`;

  let promptText;

  if (hasMedia) {
    promptText = `Investigate the attached ${post.mediaType || "media"} clip (filename: "${post.mediaFile.name}").

IMPORTANT: This post may have NO caption. That is completely normal. DO NOT reject or stop the
investigation because the caption is missing.

If there is no caption, watch/listen to the attached media and identify the main claim, message,
or information a viewer would take away from it.

Read any visible on-screen text as part of the post.

The media was uploaded directly by the player rather than linked from a platform, so there is no
publisher account or original URL. Note that honestly in the "publisher" and "source" findings
instead of guessing one.

Identify the core claim made in the clip, then investigate it.

Search for:
- where the claim originates
- whether reliable sources report the same claim
- whether evidence supports the claim
- whether statistics are supported
- whether the language is emotionally manipulative
- whether other reliable sources confirm or contradict it

Answer the six clue questions, then give your overall verdict and confidence, following the JSON
schema exactly.`;
  } else {
    promptText = `Investigate this social media post.

IMPORTANT: A caption is OPTIONAL.

If the post has no caption, DO NOT reject the post and DO NOT treat the missing caption as
suspicious.

Platform: ${post.platform || "(unknown)"}
Author / account: ${post.author || "(unknown)"}${
      post.handle ? ` (${post.handle})` : ""
    }

${captionLine}

Original link: ${post.permalink || "(not available)"}

If an image is attached, inspect the image directly. Read any visible text and identify the
main claim or message shown in the image.

Use whatever information is actually available to investigate the post.

Answer the six clue questions, then give your overall verdict and confidence, following the JSON
schema exactly.

If you can't verify something even after searching, say so honestly in that clue's finding
instead of guessing.`;
  }

  const parts = [{ text: promptText }];

  // Attach uploaded video/audio.
  if (hasMedia) {
    parts.push({
      inlineData: {
        mimeType: post.mediaFile.mimeType,
        data: post.mediaFile.data,
      },
    });
  }

  // Attach an image when there is no uploaded media.
  else if (post.image) {
    const imagePart = await fetchImageAsInlineData(post.image);

    if (imagePart) {
      parts.push({
        inlineData: imagePart,
      });
    }
  }

  try {
    const { text, sources } = await groundedGenerate({
      systemInstruction: SYSTEM,
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      json: true,
    });

    const parsed = parseJsonLoose(text);

    // Merge in the question text so the frontend doesn't need to duplicate it.
    const clues = CLUE_QUESTIONS.map((c) => {
      const found = parsed.clues?.find((x) => x.id === c.id);

      return {
        id: c.id,
        question: c.q,
        finding: found?.finding || "No finding returned.",
      };
    });

    res.status(200).json({
      clues,
      verdict: parsed.verdict || "unverified",
      confidence:
        typeof parsed.confidence === "number"
          ? parsed.confidence
          : 50,
      summary: parsed.summary || "",
      sources,
    });
  } catch (err) {
    console.error("Analysis error:", err);

    const status = err.code === "NO_API_KEY" ? 501 : 502;

    res.status(status).json({
      error: err.message || "Analysis failed.",
    });
  }
} 