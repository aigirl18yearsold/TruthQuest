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

    // Keep Google Search grounding enabled.
    tools: [{ google_search: {} }],
  };

  // IMPORTANT:
  // Do NOT send responseMimeType: "application/json" together
  // with Google Search grounding on this request.
  //
  // The prompt already tells Scout to return JSON, and
  // parseJsonLoose() handles the JSON parsing afterward.

  let response;

  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    const err = new Error(
      "Could not connect to Gemini. Please try again."
    );
    err.code = "NETWORK_ERROR";
    throw err;
  }

  const responseText = await response.text().catch(() => "");

  if (!response.ok) {
    let apiMessage = "";

    try {
      const parsed = JSON.parse(responseText);
      apiMessage = parsed?.error?.message || "";
    } catch {
      // Keep fallback message.
    }

    if (response.status === 429) {
      const err = new Error(
        "Gemini's quota is temporarily unavailable. Please try again later."
      );
      err.code = "RATE_LIMIT";
      throw err;
    }

    if (response.status === 401 || response.status === 403) {
      const err = new Error(
        "Gemini rejected the API key. Check GEMINI_API_KEY."
      );
      err.code = "INVALID_API_KEY";
      throw err;
    }

    if (response.status === 404) {
      const err = new Error(
        `Gemini model "${MODEL}" was not found. Check GEMINI_MODEL.`
      );
      err.code = "MODEL_NOT_FOUND";
      throw err;
    }

    if (response.status === 400) {
      const err = new Error(
        apiMessage ||
          "Gemini rejected the request. Check the media format and request settings."
      );
      err.code = "BAD_REQUEST";
      throw err;
    }

    const err = new Error(
      apiMessage ||
        `Gemini API error (${response.status}).`
    );
    err.code = "API_ERROR";
    throw err;
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    const err = new Error(
      "Gemini returned an invalid response."
    );
    err.code = "INVALID_RESPONSE";
    throw err;
  }

  const candidate = data?.candidates?.[0];

  if (!candidate) {
    throw new Error("Gemini did not return an analysis.");
  }

  const parts = candidate?.content?.parts || [];

  const text = parts
    .map((part) => part?.text || "")
    .join("\n")
    .trim();

  if (!text) {
    const reason =
      candidate?.finishReason ||
      "unknown";

    throw new Error(
      `Gemini returned no analysis. Finish reason: ${reason}.`
    );
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
        // Continue below.
      }
    }

    throw new Error("Model did not return valid JSON.");
  }
}