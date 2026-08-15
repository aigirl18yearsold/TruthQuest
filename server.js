import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import fetchPostHandler from "./api/fetch-post.js";
import analyzeHandler from "./api/analyze.js";
import chatHandler from "./api/chat.js";
import scoreHandler from "./api/score.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.get('/health', (_req, res) => res.json({status:'ok', uptime: process.uptime()}));

app.use(express.json({ limit: "30mb" }));

app.post("/api/fetch-post", fetchPostHandler);
app.post("/api/analyze", analyzeHandler);
app.post("/api/chat", chatHandler);
app.post("/api/score", scoreHandler);

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`TruthQuest listening on port ${port}`);
});
