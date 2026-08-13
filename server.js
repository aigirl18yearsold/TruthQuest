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

app.post("/api/research", async (req, res) => {
  try {
    const {
      claim,
      url,
      reasoning = [],
      decision = "investigate"
    } = req.body;

    if (!claim && !url) {
      return res.status(400).json({
        error: "Please provide a claim or URL."
      });
    }

    const prompt = `
User decision:
${decision}

User reasoning:
${reasoning.join(", ") || "No reasoning selected"}

Claim:
${claim || "Extract the relevant claim from the URL."}

Public URL:
${url || "None"}

Investigate this claim using current information.

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
    console.error(error);

    res.status(500).json({
      error:
        "TruthQuest could not complete the live research."
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    geminiConfigured:
      Boolean(process.env.GEMINI_API_KEY)
  });
});

app.listen(PORT, () => {
  console.log(
    `TruthQuest running on port ${PORT}`
  );
});
app.post("/api/extract-post", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "Please provide a public post URL."
      });
    }

    const prompt = `
You are TruthQuest's social-post extraction assistant.

Analyze this PUBLIC URL:

${url}

Extract ONLY information that is actually available from the page.

Return ONLY valid JSON in this exact structure:

{
  "platform": "",
  "author": "",
  "handle": "",
  "date": "",
  "text": "",
  "image": "",
  "likes": "",
  "comments": "",
  "shares": "",
  "source": "",
  "url": ""
}

Rules:
- Never invent information.
- If something cannot be found, use an empty string.
- Keep the post text exactly as available, without adding your own claims.
- For image, return a publicly accessible image URL only if one is actually available.
- The source should be the publication/account name when available.
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

    // Remove accidental markdown code fences.
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let post;

    try {
      post = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "The post could not be extracted as structured data."
      });
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error("Post extraction error:", error);

    res.status(500).json({
      error: "TruthQuest couldn't load this post."
    });
  }
});
