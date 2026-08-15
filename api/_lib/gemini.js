const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function groundedGenerate({
  systemInstruction,
  contents,
  json = false,
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const err = new Error(
      "GEMINI_API_KEY is not configured on the server."
    );
    err.code = "NO_API_KEY";
    throw err;
  }

  const body = {
    contents,
    systemInstruction: systemInstruction
      ? {
          parts: [{ text: systemInstruction }],
        }
      : undefined,

    // Gemini 3.6 Flash supports Google Search grounding.
    tools: [{ google_search: {} }],

    generationConfig: json
      ? {
          responseMimeType: "application/json",
        }
      : undefined,
  };

  let res;

  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    const err = new Error(
      "Could not connect to the Gemini API. Please try again."
    );
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const detail = await res.text().catch(() => "");

  if (!res.ok) {
    let apiMessage = "";

    try {
      const parsed = JSON.parse(detail);
      apiMessage = parsed?.error?.message || "";
    } catch {
      // Keep the raw response fallback below.
    }

    if (res.status === 429) {
      const err = new Error(
        "Gemini's quota is temporarily unavailable. Please try again later."
      );
      err.code = "RATE_LIMIT";
      throw err;
    }

    if (res.status === 401 || res.status === 403) {
      const err = new Error(
        "Gemini rejected the API key. Check GEMINI_API_KEY in your server environment variables."
      );
      err.code = "INVALID_API_KEY";
      throw err;
    }

    if (res.status === 404) {
      const err = new Error(
        `Gemini model "${MODEL}" was not found. Check GEMINI_MODEL.`
      );
      err.code = "MODEL_NOT_FOUND";
      throw err;
    }

    if (res.status === 400) {
      const err = new Error(
        apiMessage ||
          "Gemini rejected the request. The media or request format may not be supported."
      );
      err.code = "BAD_REQUEST";
      throw err;
    }

    const err = new Error(
      apiMessage ||
        `Gemini API error (${res.status}).`
    );

    err.code = "API_ERROR";
    throw err;
  }

  let data;

  try {
    data = JSON.parse(detail);
  } catch {
    const err = new Error(
      "Gemini returned an invalid response."
    );
    err.code = "INVALID_RESPONSE";
    throw err;
  }

  const candidate = data?.candidates?.[0];

  if (!candidate) {
    const err = new Error(
      "Gemini did not return an analysis."
    );
    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  const parts = candidate?.content?.parts || [];

  const text = parts
    .map((part) => part?.text || "")
    .join("\n")
    .trim();

  if (!text) {
    const finishReason = candidate?.finishReason;

    const err = new Error(
      finishReason
        ? `Gemini did not return text. Finish reason: ${finishReason}.`
        : "Gemini returned an empty analysis."
    );

    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  const chunks =
    candidate?.groundingMetadata?.groundingChunks || [];

  const sources = chunks
    .map((chunk) => {
      if (!chunk?.web?.uri) return null;

      return {
        title: chunk.web.title || "Source",
        url: chunk.web.uri,
      };
    })
    .filter(Boolean)
    .slice(0, 6);

  return {
    text,
    sources,
    raw: data,
  };
}

/**
 * Best-effort JSON parser.
 * Removes markdown fences and extracts the first JSON object if necessary.
 */
export function parseJsonLoose(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Model returned no usable JSON.");
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // Continue to the final error below.
      }
    }

    throw new Error("Model did not return valid JSON.");
  }
}