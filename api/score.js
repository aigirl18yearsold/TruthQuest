import { groundedGenerate, parseJsonLoose } from "./_lib/gemini.js";

const SYSTEM = `You are grading a player's performance in TruthQuest, a media-literacy game, after
they investigated a real social media post and discussed it with you (the AI coach).

Score their demonstrated skill across three categories, each 0-100:
- sourceChecking: did they question who published it and whether it's a credible account?
- evidenceEvaluation: did they look for an original source/study and notice when evidence was missing or weak?
- manipulationDetection: did they notice emotionally manipulative language, exaggeration, or engagement-bait?

Base this on what they actually said and asked in the conversation — not on whether the post
turned out true or false. A player who asks sharp questions but reaches a tentative conclusion
should score well. A player who accepted the claim without questioning anything should score low.

Respond with ONLY JSON:
{
  "sourceChecking": 0-100,
  "evidenceEvaluation": 0-100,
  "manipulationDetection": 0-100,
  "summary": "2-3 encouraging but honest sentences, coach voice, specific to what they did well or missed"
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  const { post, analysis, decision, history } = req.body || {};

  const transcript = (history || [])
    .map((h) => `${h.role === "assistant" ? "COACH" : "PLAYER"}: ${h.text || "[attachment]"}`)
    .join("\n");

  const prompt = `POST: "${post?.text || ""}" (${post?.platform || "unknown platform"})
INVESTIGATION VERDICT: ${analysis?.verdict || "unverified"}
PLAYER'S FIRST GUT CALL: ${decision || "not recorded"}

CONVERSATION TRANSCRIPT:
${transcript || "(player did not chat before requesting a score — grade generously but note this in the summary)"}

Grade the player now, following the JSON schema exactly.`;

  try {
    const { text } = await groundedGenerate({
      systemInstruction: SYSTEM,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      json: true,
    });
    const parsed = parseJsonLoose(text);
    res.status(200).json({
      sourceChecking: clamp(parsed.sourceChecking),
      evidenceEvaluation: clamp(parsed.evidenceEvaluation),
      manipulationDetection: clamp(parsed.manipulationDetection),
      summary: parsed.summary || "",
    });
  } catch (err) {
    const status = err.code === "NO_API_KEY" ? 501 : 502;
    res.status(status).json({ error: err.message || "Scoring failed." });
  }
}

function clamp(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return 50;
  return Math.max(0, Math.min(100, Math.round(v)));
}