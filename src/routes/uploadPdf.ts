import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import neo4j from "neo4j-driver";
import { embed } from "../services/embed.js";

export default function uploadPdfRoute() {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  const driver = neo4j.driver(
    process.env.NEO4J_URL!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASS!)
  );

  function chunkText(text: string, size = 800) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.substring(i, i + size));
    }
    return chunks;
  }

  router.post("/upload-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum PDF enviado." });
      }

      const data = await pdf(req.file.buffer);
      const chunks = chunkText(data.text);
      const session = driver.session();

      const docId = `${req.file.originalname}-${Date.now()}`;

      await session.run(
        `MERGE (d:Document { id: $id })
         SET d.filename = $filename,
             d.createdAt = datetime()`,
        { id: docId, filename: req.file.originalname }
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const vector = await embed(content);

        await session.run(
          `MATCH (d:Document { id: $id })
           CREATE (d)-[:HAS_CHUNK]->(
             :Chunk {
               index: $idx,
               content: $content,
               embedding: $embedding,
               createdAt: datetime()
             }
           )`,
          { id: docId, idx: i, content, embedding: vector }
        );
      }

      await session.close();

      return res.json({
        ok: true,
        filename: req.file.originalname,
        chunks: chunks.length
      });
    } catch {
      return res.status(500).json({ error: "Erro ao processar PDF." });
    }
  });

  return router;
}