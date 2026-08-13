const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Calls Gemini with Google Search grounding enabled, so answers are checked
 * against live web results instead of the model's memory alone.
 *
 * @param {object} opts
 * @param {string} opts.systemInstruction
 * @param {Array}  opts.contents - Gemini "contents" array: [{ role, parts: [...] }]
 * @param {boolean} [opts.json] - ask for a strict JSON response
 */
export async function groundedGenerate({ systemInstruction, contents, json = false }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "GEMINI_API_KEY is not configured on the server. Add it in your Vercel project's Environment Variables."
    );
    err.code = "NO_API_KEY";
    throw err;
  }

  const body = {
    contents,
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    tools: [{ google_search: {} }],
    generationConfig: json ? { responseMimeType: "application/json" } : undefined,
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || "").join("\n").trim() || "";

  const chunks = candidate?.groundingMetadata?.groundingChunks || [];
  const sources = chunks
    .map((c) => c.web && { title: c.web.title, url: c.web.uri })
    .filter(Boolean)
    .slice(0, 6);

  return { text, sources, raw: data };
}

/** Best-effort JSON parse: strips ```json fences and grabs the first {...} block if needed. */
export function parseJsonLoose(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    throw new Error("Model did not return valid JSON.");
  }
}