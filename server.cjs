var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "15mb" }));
  app.post("/api/generate-mystery", async (req, res) => {
    try {
      const { prompt, worldId } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY missing" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const systemInstruction = `You are Detective AI Studio. Generate a 4-phase mystery case file for a game in JSON format.
      The JSON object must match this schema:
      {
        "caseData": {
          "id": "custom-ai",
          "num": "AI",
          "worldId": "${worldId || "disaster-city"}",
          "title": "Short Fun Title",
          "emoji": "\u{1F50D}",
          "desc": "Short description of the mystery",
          "mechanicType": "standard",
          "scene": {
            "bgGradient": ["#0F172A", "#1E293B", "#334155"],
            "mainEmoji": "\u{1F50D}\u2728",
            "decorEmojis": ["\u2B50", "\u{1F4DC}", "\u26A1"]
          },
          "clues": {
            "c1": { "id": "c1", "icon": "\u{1F50D}", "title": "Clue 1 Title", "desc": "Clue 1 Desc", "note": "Clue 1 Note" },
            "c2": { "id": "c2", "icon": "\u{1F4DC}", "title": "Clue 2 Title", "desc": "Clue 2 Desc", "note": "Clue 2 Note" },
            "c3": { "id": "c3", "icon": "\u{1F9EA}", "title": "Clue 3 Title", "desc": "Clue 3 Desc", "note": "Clue 3 Note" },
            "c4": { "id": "c4", "icon": "\u2699\uFE0F", "title": "Clue 4 Title", "desc": "Clue 4 Desc", "note": "Clue 4 Note" },
            "secret": { "id": "secret", "icon": "\u{1F451}", "title": "Secret Item", "desc": "Hidden secret item", "note": "Secret found!", "isSecret": true }
          },
          "hotspots": [
            { "x": 30, "y": 50, "clueId": "c1" },
            { "x": 70, "y": 70, "clueId": "c2" },
            { "x": 20, "y": 30, "clueId": "c3" },
            { "x": 80, "y": 25, "clueId": "c4" },
            { "x": 85, "y": 85, "clueId": "secret" }
          ],
          "witness": {
            "avatar": "\u{1F9D1}\u200D\u{1F52C}",
            "name": "Eyewitness Alex",
            "quote": "Statement from witness",
            "footage": "FOOTAGE: Video replay description"
          },
          "timeline": {
            "correctOrder": ["step1", "step2", "step3", "step4", "step5"],
            "cards": {
              "step1": "First event",
              "step2": "Second event",
              "step3": "Third event",
              "step4": "Fourth event",
              "step5": "Fifth event"
            }
          },
          "culprits": [
            { "id": "suspect1", "name": "Prime Suspect Name", "emoji": "\u{1F575}\uFE0F", "isCorrect": true },
            { "id": "suspect2", "name": "False Suspect 1", "emoji": "\u{1F916}", "isCorrect": false, "wrongMessage": "Innocent explanation" },
            { "id": "suspect3", "name": "False Suspect 2", "emoji": "\u{1F468}\u200D\u{1F373}", "isCorrect": false, "wrongMessage": "Innocent explanation" },
            { "id": "suspect4", "name": "False Suspect 3", "emoji": "\u{1F468}\u200D\u{1F33E}", "isCorrect": false, "wrongMessage": "Innocent explanation" }
          ],
          "repair": {
            "title": "Repair Title",
            "brokenEmoji": "\u26A1\u{1F4A5}",
            "fixedEmoji": "\u2728\u{1F389}",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "holdLabel": "\u{1F6E0}\uFE0F Hold to Repair Anomaly"
          },
          "badge": "Custom Detective Badge",
          "secretBadge": "Quantum Sleuth",
          "ending": {
            "1": "First resolution sentence",
            "2": "Second resolution sentence",
            "3": "Third victory sentence"
          }
        }
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: "Failed to generate mystery", details: err.message });
    }
  });
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt, imageBase64, mimeType, aspectRatio } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, "") : "";
      const operation = await ai.models.generateVideos({
        model: "veo-3.1-fast-generate-preview",
        prompt: prompt || "Animate this photo with smooth cinematic camera movement and realistic atmospheric motion",
        ...cleanBase64 ? {
          image: {
            imageBytes: cleanBase64,
            mimeType: mimeType || "image/png"
          }
        } : {},
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9"
        }
      });
      res.json({ operationName: operation.name });
    } catch (err) {
      console.error("Veo Generate Video Error:", err);
      res.status(500).json({ error: err.message || "Failed to start video generation" });
    }
  });
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }
      if (!operationName) {
        return res.status(400).json({ error: "operationName parameter is required" });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const op = new import_genai.GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({
        done: updated.done,
        error: updated.error || null
      });
    } catch (err) {
      console.error("Veo Video Status Error:", err);
      res.status(500).json({ error: err.message || "Failed to check operation status" });
    }
  });
  app.post("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }
      if (!operationName) {
        return res.status(400).json({ error: "operationName parameter is required" });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const op = new import_genai.GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Generated video URI not found in operation output" });
      }
      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": apiKey }
      });
      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video file from storage: ${videoRes.statusText}`);
      }
      res.setHeader("Content-Type", "video/mp4");
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error("Veo Video Download Error:", err);
      res.status(500).json({ error: err.message || "Failed to download video file" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
