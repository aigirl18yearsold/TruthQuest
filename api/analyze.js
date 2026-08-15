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
teaches people to evaluate social media posts critically.

You are NOT a fact-checking verdict machine. You gather evidence for a human investigator.

A post MAY have no caption. This is completely normal. NEVER reject a post just because its
caption is missing.

If an attached video or audio exists:
- Watch or listen to it.
- Identify the main claim or message.
- Read visible on-screen text.
- Investigate the claim using reliable sources.

If an image exists:
- Inspect the image directly.
- Read visible text.
- Identify the main claim or message.
- Investigate that claim.

Use Google Search to check:
- who published it
- whether an original source exists
- whether evidence exists
- whether statistics are supported
- whether reliable sources confirm or contradict the claim
- whether the language is emotionally manipulative

If something cannot be verified, say so honestly instead of guessing.

Respond with ONLY a JSON object matching exactly this shape:

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
  "summary": "2-3 sentence coach-voice opening for a follow-up conversation with the player."
}`;

const MAX_MEDIA_BYTES = 14 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

async function fetchImageAsInlineData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) return null;

    const contentType =
      (response.headers.get("content-type") || "").split(";")[0];

    if (!contentType.startsWith("image/")) return null;

    const buffer = await response.arrayBuffer();

    if (buffer.byteLength > MAX_IMAGE_BYTES) return null;

    return {
      mimeType: contentType,
      data: Buffer.from(buffer).toString("base64"),
    };
  } catch (error) {
    console.warn("Could not fetch preview image:", error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({
      error: "Use POST.",
    });
    return;
  }

  try {
    const { post } = req.body || {};

    if (!post) {
      res.status(400).json({
        error: "No post was provided for Scout to investigate.",
        code: "NO_POST",
      });
      return;
    }

    const hasMedia = Boolean(post?.mediaFile?.data);

    /*
     * IMPORTANT:
     * A caption is NOT required.
     *
     * Scout can investigate using:
     * - video/audio
     * - image
     * - post URL
     * - author/account
     * - title
     * - caption/text
     */
    const hasAnyContent =
      Boolean(post.text) ||
      Boolean(post.title) ||
      Boolean(post.image) ||
      Boolean(post.permalink) ||
      Boolean(post.author) ||
      Boolean(post.handle) ||
      Boolean(post.platform) ||
      hasMedia;

    if (!hasAnyContent) {
      res.status(400).json({
        error: "There's nothing here for Scout to investigate yet.",
        code: "NO_CONTENT",
      });
      return;
    }

    /*
     * Check uploaded media size before sending it to Gemini.
     */
    if (hasMedia) {
      const base64Length = post.mediaFile.data.length;
      const approxBytes = base64Length * 0.75;

      if (approxBytes > MAX_MEDIA_BYTES) {
        res.status(413).json({
          error:
            "That clip is too large to analyze directly — try a shorter clip under about 14MB.",
          code: "MEDIA_TOO_LARGE",
        });
        return;
      }

      if (!post.mediaFile.mimeType) {
        res.status(400).json({
          error: "The uploaded media is missing its file type.",
          code: "MISSING_MEDIA_TYPE",
        });
        return;
      }
    }

    const captionLine = post.text
      ? `Post text / caption:
"""${post.text}"""`
      : `Post text / caption:
(none found — this post has no caption. This is normal. Do NOT reject the post because of this.)`;

    let promptText;

    if (hasMedia) {
      promptText = `Investigate the attached ${post.mediaType || "media"}.

Filename: "${post.mediaFile.name || "uploaded media"}"

IMPORTANT:
This post has no caption, but that is completely okay.

Do NOT stop the investigation because there is no caption.

Instead, analyze the attached media itself.

If it is a video:
1. Watch the video.
2. Read visible on-screen text.
3. Identify the main claim, statement, or message.
4. Investigate that claim.

If it is audio:
1. Listen to the audio.
2. Identify the main claim.
3. Investigate that claim.

If the media contains visible text, use that text as part of your investigation.

The media was uploaded directly by the player, so there may be no publisher account or original
URL. If those details are unavailable, say so honestly rather than guessing.

Search for reliable sources that can confirm, contradict, or provide context for the claim.

Answer all six clue questions and return the required JSON format exactly.`;
    } else {
      promptText = `Investigate this social media post.

IMPORTANT:
A caption is OPTIONAL.

If there is no caption, do NOT reject the post and do NOT treat the missing caption as suspicious.

Platform: ${post.platform || "(unknown)"}

Author / account: ${post.author || "(unknown)"}${
        post.handle ? ` (${post.handle})` : ""
      }

${captionLine}

Title:
${post.title || "(none)"}

Original link:
${post.permalink || "(not available)"}

${
  post.image
    ? "An image is attached. Inspect the image directly, including any visible text."
    : ""
}

Use whatever information is available to identify the main claim and investigate it.

Answer all six clue questions and return the required JSON format exactly.`;
    }

    const parts = [
      {
        text: promptText,
      },
    ];

    /*
     * Send uploaded video/audio/image to Gemini.
     */
    if (hasMedia) {
      parts.push({
        inlineData: {
          mimeType: post.mediaFile.mimeType,
          data: post.mediaFile.data,
        },
      });
    } else if (post.image) {
      const imagePart = await fetchImageAsInlineData(post.image);

      if (imagePart) {
        parts.push({
          inlineData: imagePart,
        });
      }
    }

    console.log("Scout analysis starting:", {
      platform: post.platform || null,
      hasCaption: Boolean(post.text),
      hasImage: Boolean(post.image),
      hasMedia,
      mediaType: post.mediaType || null,
      hasPermalink: Boolean(post.permalink),
    });

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

    if (!text) {
      throw new Error("Gemini returned an empty analysis.");
    }

    const parsed = parseJsonLoose(text);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Gemini returned an invalid analysis object.");
    }

    const clues = CLUE_QUESTIONS.map((clue) => {
      const found = Array.isArray(parsed.clues)
        ? parsed.clues.find((item) => item?.id === clue.id)
        : null;

      return {
        id: clue.id,
        question: clue.q,
        finding:
          found?.finding ||
          "Scout could not find enough reliable evidence for this clue.",
      };
    });

    const validVerdicts = [
      "credible",
      "misleading",
      "unverified",
    ];

    const verdict = validVerdicts.includes(parsed.verdict)
      ? parsed.verdict
      : "unverified";

    const confidence =
      typeof parsed.confidence === "number" &&
      Number.isFinite(parsed.confidence)
        ? Math.max(0, Math.min(100, parsed.confidence))
        : 50;

    res.status(200).json({
      clues,
      verdict,
      confidence,
      summary: parsed.summary || "",
      sources: Array.isArray(sources) ? sources : [],
    });
  } catch (err) {
    /*
     * IMPORTANT:
     * Return the REAL error to the frontend while we diagnose this.
     * This prevents every Gemini problem from looking like the same
     * generic "temporary hiccup".
     */
    console.error("REAL ANALYSIS ERROR:", err);

    res.status(500).json({
      error: err?.message || "Analysis failed.",
      code: err?.code || "UNKNOWN_ERROR",
    });
  }
}