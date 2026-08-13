import { groundedGenerate, parseJsonLoose } from "./_lib/gemini.js";

const CLUE_QUESTIONS = [
  { id: "publisher", q: "Who published it?" },
  { id: "source", q: "Is there an original source?" },
  { id: "evidence", q: "Is evidence provided?" },
  { id: "statistic", q: "Is the statistic or central claim supported?" },
  { id: "language", q: "Is the language emotionally manipulative?" },
  { id: "crosscheck", q: "Can other reliable sources confirm it?" },
];

const SYSTEM = `You are the investigation engine inside TruthQuest, a media-literacy app that teaches
people to evaluate social media posts critically. You are NOT a fact-checking verdict machine —
you are gathering evidence for a human investigator (the player) to reason about themselves.

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  const { post } = req.body || {};
  if (!post || !post.text) {
    res.status(400).json({ error: "Missing post to analyze." });
    return;
  }

  const prompt = `Investigate this social media post.

Platform: ${post.platform}
Author / account: ${post.author}${post.handle ? ` (${post.handle})` : ""}
Post text / caption: """${post.text}"""
Original link: ${post.permalink}

Answer the six clue questions, then give your overall verdict and confidence, following the JSON
schema exactly. If you can't verify something even after searching, say so honestly in that
clue's finding instead of guessing.`;

  try {
    const { text, sources } = await groundedGenerate({
      systemInstruction: SYSTEM,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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