import { groundedGenerate } from "./_lib/gemini.js";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per attachment, base64-decoded size estimate
const MAX_FILES_PER_MESSAGE = 3;

function systemFor(post, analysis) {
  const isUpload = post?.source === "upload";
  const postBlock = isUpload
    ? `POST BEING INVESTIGATED
An uploaded ${post?.mediaType || "media"} clip (filename: "${post?.mediaFile?.name || "unknown"}"), not a linked post.
There is no publisher account or original URL for this one — don't invent one.`
    : `POST BEING INVESTIGATED
Platform: ${post?.platform}
Author: ${post?.author}${post?.handle ? ` (${post.handle})` : ""}
Text: """${post?.text || ""}"""
Link: ${post?.permalink}`;

  return `You are Scout, the AI Coach in TruthQuest, a media-literacy game. If asked your name, say
Scout. The player is investigating a real post and is now talking it through with you.

${postBlock}

${analysis ? `YOUR EARLIER INVESTIGATION FINDINGS
Verdict: ${analysis.verdict} (confidence ${analysis.confidence}/100)
${(analysis.clues || []).map((c) => `- ${c.question} → ${c.finding}`).join("\n")}` : ""}

HOW TO COACH:
- Act like a thoughtful mentor, never a verdict machine. Never just say "true" or "fake."
- Ask questions back when it helps them reason it out themselves.
- If the player shares a screenshot, image, or file (e.g. "here's the study I found"), actually
  look at it and evaluate whether it genuinely supports the claim.
- You have live Google Search — use it to check specific facts, sources, or counter-claims the
  player brings up, and mention what you found in plain language.
- Keep replies concise: 2-5 sentences, unless the player is asking for depth.
- Stay warm, curious, and specific to THIS post — avoid generic media-literacy platitudes.`;
}

function toGeminiParts(text, files) {
  const parts = [];
  if (text) parts.push({ text });
  for (const f of files || []) {
    parts.push({ inlineData: { mimeType: f.mimeType, data: f.data } });
  }
  return parts;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  const { post, analysis, history, message } = req.body || {};

  if (!message || (!message.text && !(message.files || []).length)) {
    res.status(400).json({ error: "Message is empty." });
    return;
  }

  const files = (message.files || []).slice(0, MAX_FILES_PER_MESSAGE);
  for (const f of files) {
    const approxBytes = (f.data?.length || 0) * 0.75;
    if (approxBytes > MAX_FILE_BYTES) {
      res.status(413).json({ error: `"${f.name || "attachment"}" is too large (max 8MB).` });
      return;
    }
  }

  const contents = [
    ...(history || []).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: toGeminiParts(h.text, h.files),
    })),
    { role: "user", parts: toGeminiParts(message.text, files) },
  ];

  try {
    const { text, sources } = await groundedGenerate({
      systemInstruction: systemFor(post, analysis),
      contents,
    });
    res.status(200).json({ reply: text, sources });
  } catch (err) {
    const status = err.code === "NO_API_KEY" ? 501 : 502;
    res.status(status).json({ error: err.message || "Chat failed." });
  }
}