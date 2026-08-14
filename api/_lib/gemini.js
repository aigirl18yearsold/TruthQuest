const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
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
    let message = `Gemini API error (${res.status}).`;
    try {
      const parsed = JSON.parse(detail);
      const apiMessage = parsed?.error?.message || "";
      if (res.status === 429) {
        message = "Gemini's free-tier quota is used up for now — wait a bit and try again, or enable billing in Google AI Studio for a higher limit.";
      } else if (res.status === 404) {
        message = "The configured Gemini model isn't available. Check GEMINI_MODEL in your environment variables.";
      } else if (res.status === 401 || res.status === 403) {
        message = "Gemini rejected the API key. Check GEMINI_API_KEY is set correctly.";
      } else if (apiMessage) {
        message = `Gemini API error: ${apiMessage.split("\n")[0].slice(0, 160)}`;
      }
    } catch {
      // Response wasn't JSON — keep the generic status-code message above.
    }
    const err = new Error(message);
    err.code = res.status === 429 ? "RATE_LIMIT" : "API_ERROR";
    throw err;
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