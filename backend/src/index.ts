import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import { pipeline } from "@xenova/transformers";

dotenv.config();

// -------------------------------
// Carrega texto de PDFs da pasta
// -------------------------------
async function loadPDFsFromFolder(folderPath: string) {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".pdf"));
  const documents: Array<{ text: string; source: string }> = [];

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const buffer = fs.readFileSync(fullPath);
    const parsed = await pdf(buffer);

    documents.push({
      text: parsed.text,
      source: file,
    });
  }

  return documents;
}

// -------------------------------------
// Quebra texto em chunks (1000 / 200)
// -------------------------------------
function splitText(text: string, chunkSize = 1000, overlap = 200) {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

// -------------------------------------
// INGESTÃO COMPLETA PARA O NEO4J
// -------------------------------------
async function main() {
  console.log("🔄 Carregando modelo local MiniLM-L6-v2...");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  const pdfFolder = path.join(process.cwd(), process.env.PDF_FOLDER || "./backend/src/files");
  console.log(`📁 Lendo PDFs da pasta: ${pdfFolder}`);

  const rawDocs = await loadPDFsFromFolder(pdfFolder);
  console.log(`📄 ${rawDocs.length} PDFs carregados.`);

  // Conecta no Neo4j
  const driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
  );
  const session = driver.session();

  console.log("📌 Criando índice de vetor no Neo4j (se não existir)...");
  await session.run(
    `
    CREATE INDEX chunk_vector_index IF NOT EXISTS
    FOR (c:Chunk) ON (c.embedding)
  `
  );

  // Apaga ingestões anteriores (opcional)
  console.log("🗑 Limpando ingestão anterior...");
  await session.run("MATCH (c:Chunk) DELETE c");

  console.log("📥 Processando documentos...");

  for (const doc of rawDocs) {
    const chunks = splitText(doc.text);

    for (const chunk of chunks) {
      // Gera embedding local
      const vectorResult = await extractor(chunk, {
        pooling: "mean",
        normalize: true,
      });

      const embedding = Array.from(vectorResult.data);

      // Insere chunk no Neo4j
      await session.run(
        `
        CREATE (c:Chunk {
          text: $text,
          source: $source,
          embedding: $embedding
        })
      `,
        {
          text: chunk,
          source: doc.source,
          embedding,
        }
      );
    }
  }

  console.log("✅ Ingestão concluída com sucesso!");

  await session.close();
  await driver.close();
}

main().catch(err => console.error("❌ Erro na ingestão:", err));