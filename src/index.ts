import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { DocumentProcessor } from "./documentProcessor.js";
import { CONFIG } from "./config/env.js";
import { mkdir } from "node:fs/promises";
import { existsSync } from "fs";
import path from "path";
import { type PretrainedOptions } from "@huggingface/transformers";

let vectorStore: Neo4jVectorStore | null = null;

async function ensureFilesFolder() {
  const folderPath = path.join(process.cwd(), CONFIG.pdf.folder);
  if (!existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true });
  }
}

async function clearAll(store: Neo4jVectorStore, label: string) {
  await store.query(`MATCH (n:\`${label}\`) DETACH DELETE n`);
}

async function main() {
  console.log("📁 Iniciando ingestão dos PDFs...");

  await ensureFilesFolder();

  const processor = new DocumentProcessor(CONFIG.textSplitter);
  const documents = await processor.loadAndSplit();

  if (documents.length === 0) {
    console.log("⚠️ Nenhum documento encontrado para ingestão.");
    return;
  }

  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: CONFIG.embedding.modelName,
    pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions,
  });

  vectorStore = await Neo4jVectorStore.fromExistingGraph(
    embeddings,
    CONFIG.neo4j
  );

  console.log("🧹 Limpando índice anterior...");
  await clearAll(vectorStore, CONFIG.neo4j.nodeLabel);

  console.log(`📚 Inserindo ${documents.length} chunks no Neo4j...`);
  for (const doc of documents) {
    await vectorStore.addDocuments([doc]);
  }

  await mkdir(CONFIG.output.answersFolder, { recursive: true });

  console.log("✅ Ingestão completa.");
  console.log("🚀 Seu servidor pode agora responder perguntas via /api/ask.");
}

main()
  .catch((err) => console.error("❌ Erro na ingestão:", err))
  .finally(async () => {
    await vectorStore?.close();
  });