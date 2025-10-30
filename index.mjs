import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLEAI_API_KEY });

const app = express();
app.use(express.json());

app.post("/api/genai", async (req, res) => {
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

        const result = response.candidates?.[0]?.content || "No content returned";

        res.json({ result });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
