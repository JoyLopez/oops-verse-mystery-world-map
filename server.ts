import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API endpoint for Gemini AI Mystery Generation
  app.post('/api/generate-mystery', async (req, res) => {
    try {
      const { prompt, worldId } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY missing' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are Detective AI Studio. Generate a 4-phase mystery case file for a game in JSON format.
      The JSON object must match this schema:
      {
        "caseData": {
          "id": "custom-ai",
          "num": "AI",
          "worldId": "${worldId || 'disaster-city'}",
          "title": "Short Fun Title",
          "emoji": "🔍",
          "desc": "Short description of the mystery",
          "mechanicType": "standard",
          "scene": {
            "bgGradient": ["#0F172A", "#1E293B", "#334155"],
            "mainEmoji": "🔍✨",
            "decorEmojis": ["⭐", "📜", "⚡"]
          },
          "clues": {
            "c1": { "id": "c1", "icon": "🔍", "title": "Clue 1 Title", "desc": "Clue 1 Desc", "note": "Clue 1 Note" },
            "c2": { "id": "c2", "icon": "📜", "title": "Clue 2 Title", "desc": "Clue 2 Desc", "note": "Clue 2 Note" },
            "c3": { "id": "c3", "icon": "🧪", "title": "Clue 3 Title", "desc": "Clue 3 Desc", "note": "Clue 3 Note" },
            "c4": { "id": "c4", "icon": "⚙️", "title": "Clue 4 Title", "desc": "Clue 4 Desc", "note": "Clue 4 Note" },
            "secret": { "id": "secret", "icon": "👑", "title": "Secret Item", "desc": "Hidden secret item", "note": "Secret found!", "isSecret": true }
          },
          "hotspots": [
            { "x": 30, "y": 50, "clueId": "c1" },
            { "x": 70, "y": 70, "clueId": "c2" },
            { "x": 20, "y": 30, "clueId": "c3" },
            { "x": 80, "y": 25, "clueId": "c4" },
            { "x": 85, "y": 85, "clueId": "secret" }
          ],
          "witness": {
            "avatar": "🧑‍🔬",
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
            { "id": "suspect1", "name": "Prime Suspect Name", "emoji": "🕵️", "isCorrect": true },
            { "id": "suspect2", "name": "False Suspect 1", "emoji": "🤖", "isCorrect": false, "wrongMessage": "Innocent explanation" },
            { "id": "suspect3", "name": "False Suspect 2", "emoji": "👨‍🍳", "isCorrect": false, "wrongMessage": "Innocent explanation" },
            { "id": "suspect4", "name": "False Suspect 3", "emoji": "👨‍🌾", "isCorrect": false, "wrongMessage": "Innocent explanation" }
          ],
          "repair": {
            "title": "Repair Title",
            "brokenEmoji": "⚡💥",
            "fixedEmoji": "✨🎉",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "holdLabel": "🛠️ Hold to Repair Anomaly"
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
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: 'Failed to generate mystery', details: err.message });
    }
  });

  // API endpoint for Veo Video Generation (Image Animation)
  app.post('/api/generate-video', async (req, res) => {
    try {
      const { prompt, imageBase64, mimeType, aspectRatio } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is missing' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : '';

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this photo with smooth cinematic camera movement and realistic atmospheric motion',
        ...(cleanBase64
          ? {
              image: {
                imageBytes: cleanBase64,
                mimeType: mimeType || 'image/png',
              },
            }
          : {}),
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
        },
      });

      res.json({ operationName: operation.name });
    } catch (err: any) {
      console.error('Veo Generate Video Error:', err);
      res.status(500).json({ error: err.message || 'Failed to start video generation' });
    }
  });

  // API endpoint to poll Veo Video Status
  app.post('/api/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is missing' });
      }

      if (!operationName) {
        return res.status(400).json({ error: 'operationName parameter is required' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: updated.done,
        error: updated.error || null,
      });
    } catch (err: any) {
      console.error('Veo Video Status Error:', err);
      res.status(500).json({ error: err.message || 'Failed to check operation status' });
    }
  });

  // API endpoint to download completed Veo Video
  app.post('/api/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is missing' });
      }

      if (!operationName) {
        return res.status(400).json({ error: 'operationName parameter is required' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: 'Generated video URI not found in operation output' });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video file from storage: ${videoRes.statusText}`);
      }

      res.setHeader('Content-Type', 'video/mp4');
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Veo Video Download Error:', err);
      res.status(500).json({ error: err.message || 'Failed to download video file' });
    }
  });

  // Vite middleware for dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
