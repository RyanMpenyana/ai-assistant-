import express from "express";
import { GoogleGenAI } from "@google/genai";
import { Ollama } from 'ollama'
import dotenv from "dotenv";

dotenv.config();

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
  },
});

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLEAI_API_KEY });
const router = express.Router();

router.post("/genai", async (req, res) => {
  console.log(req.params)
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log(response);

    const result = response.candidates?.[0]?.content.parts[0].text || "No content returned";

    res.json({ result });

  } catch (err) {
    console.error(err);
    if (err.status === 503) {
      return res.status(503).json({
        error: "The model is overloaded. Please try again shortly.",
        code: 503,
      })
    } else res.status(500).json({ error: err.message });
  }

});

router.post("/llama/prompt", async (req, res, next) => {
  const { prompt } = await req.body;
  console.log("Received prompt for Ollama:", prompt);
  try {
    if (!prompt) throw new Error("Prompt is missing.");
    const response = await getResponseFromOllama(prompt);
    res.json({ result: response });
  } catch (err) {
    console.error("Error in /llama/prompt:", err);
    res.status(500).json({ error: err.message });
  }
});


const getResponseFromOllama = async (prompt) => {
  try {
    return await ollama.chat({
      model: 'gpt-oss:120b-cloud',
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (error) {
    console.error("Ollama error:", error);
    throw new Error("Failed to get response from Ollama");
  }
};

export default router;