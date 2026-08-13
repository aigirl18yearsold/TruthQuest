import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const SYSTEM_PROMPT = `
You are TruthQuest Coach, an educational media-literacy assistant.

Your job is to help users investigate online claims.

Do NOT simply answer TRUE or FALSE.

Instead:
1. Research the claim using current web information.
2. Prefer primary and authoritative sources.
3. Look for independent confirmation.
4. Identify missing evidence.
5. Identify misleading statistics or framing.
6. Identify emotionally manipulative language.
7. Explain what the evidence actually supports.
8. Clearly explain uncertainty when evidence is insufficient.
9. Never invent sources or citations.
10. Give practical verification advice.

Keep the explanation clear, concise and educational.
`;

function getCitations(interaction) {
  const citations = [];

  for (const step of interaction.steps || []) {
    if (step.type !== "model_output") continue;

    for (const block of step.content || []) {
      for (const annotation of block.annotations || []) {
        if (
          annotation.type === "url_citation" &&
          annotation.url
        ) {
          citations.push({
            title: annotation.title || annotation.url,
            url: annotation.url
          });
        }
      }
    }
  }

  return [
    ...new Map(
      citations.map(source => [source.url, source])
    ).values()
  ].slice(0, 8);
}


/* =========================
   LIVE RESEARCH
========================= */

app.post("/api/research", async (req, res) => {
  try {
    const {
      claim = "",
      url = "",
      decision = "",
      reasoning = []
    } = req.body;

    if (!claim && !url) {
      return res.status(400).json({
        error: "Please provide a claim or URL."
      });
    }

    const prompt = `
User decision:
${decision || "Not provided"}

User reasoning:
${
  Array.isArray(reasoning)
    ? reasoning.join(", ")
    : reasoning || "No reasoning selected"
}

Claim:
${claim || "No claim was manually provided."}

Public URL:
${url || "None"}

IMPORTANT:

If a public URL is provided and no claim was manually entered,
use the URL as the starting point for the investigation.

Investigate the claim using current information.

Do not invent information.

Return:
- verdict
- confidence
- coach feedback
- evidence findings
- verification checks
- sources used
`;

    const tools = [
      {
        type: "google_search"
      }
    ];

    if (url) {
      tools.push({
        type: "url_context"
      });
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: SYSTEM_PROMPT + "\n\n" + prompt,
      tools
    });

    const citations = getCitations(interaction);

    res.json({
      feedback:
        interaction.output_text ||
        "No response was returned.",
      citations
    });

  } catch (error) {
    console.error("Research error:", error);

    res.status(500).json({
      error:
        "TruthQuest could not complete the live research."
    });
  }
});


/* =========================
   EXTRACT POST FROM URL
========================= */

app.post("/api/extract-post", async (req, res) => {
  try {
    const { url = "" } = req.body;

    if (!url.trim()) {
      return res.status(400).json({
        error: "Please provide a public post URL."
      });
    }

    const prompt = `
You are the TruthQuest social-post extraction assistant.

Analyze this publicly accessible URL:

${url}

Your first task is to determine what information about the
linked page/post is actually accessible.

Extract ONLY information that can be supported by the page
or reliable information retrieved about that page.

Return ONLY valid JSON in exactly this structure:

{
  "platform": "",
  "author": "",
  "handle": "",
  "date": "",
  "text": "",
  "headline": "",
  "image": "",
  "likes": "",
  "comments": "",
  "shares": "",
  "source": "",
  "url": "${url}"
}

Rules:

- NEVER invent post text.
- NEVER invent an author.
- NEVER invent engagement numbers.
- NEVER invent a date.
- NEVER invent an image URL.
- If information is unavailable, return an empty string.
- "text" should contain the actual publicly accessible post text.
- "headline" should contain the main claim/headline if one is clearly present.
- If there is no separate headline, use the main claim from the post text.
- Keep the meaning and wording of the actual post.
- Identify the social platform when possible.
- If the URL requires login or cannot be accessed, make the unavailable fields empty.
- Return JSON only.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
      tools: [
        {
          type: "url_context"
        },
        {
          type: "google_search"
        }
      ]
    });

    let text = interaction.output_text || "";

    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let post;

    try {
      post = JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Post extraction JSON error:",
        parseError
      );

      return res.status(500).json({
        error:
          "TruthQuest received an invalid response while extracting the post."
      });
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error(
      "Post extraction error:",
      error
    );

    res.status(500).json({
      error:
        "TruthQuest couldn't load this post. The page may be private or inaccessible."
    });
  }
});


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    geminiConfigured:
      Boolean(process.env.GEMINI_API_KEY)
  });
});


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `TruthQuest running on port ${PORT}`
  );
});