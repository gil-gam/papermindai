import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ask } from "./backend/src/ask.js";

dotenv.config();

const app = express();

// Configurações
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());

// Rota principal
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "A pergunta é obrigatória." });
    }

    const resposta = await ask(question);
    res.json(resposta);
  } catch (err) {
    console.error("❌ Erro no /api/ask:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});