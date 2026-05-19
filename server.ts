import express from "express";
import cors from "cors";
import { initAI } from "./initAI.js";
import askRoute from "./src/routes/ask.js";
import uploadPdfRoute from "./src/routes/uploadPdf.js";

(async () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true }));

  console.log("🧠 Inicializando AI...");
  const ai = await initAI();
  console.log("✅ AI inicializada.");

  app.use("/api", askRoute(ai));
  app.use("/api", uploadPdfRoute());

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
})();