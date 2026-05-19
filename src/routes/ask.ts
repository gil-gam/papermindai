import express from "express";
import type { AI } from "../ai.js";

export default function askRoute(ai: AI) {
  const router = express.Router();

  router.post("/ask", async (req, res) => {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Missing question" });
      }

      // Chamamos o pipeline unificado de RAG via LangChain
      const response = await ai.answerQuestion(question);

      return res.json({
        ok: true,
        answer: response.answer,
        context: response.context,
        topScore: response.topScore,
      });
    } catch (err) {
      console.error("Erro no endpoint /api/ask:", err);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  });

  return router;
}