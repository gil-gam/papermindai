import { loadDocument } from "../loaders/documentLoader.js";
import { embedHF } from "../embeddings/hfInferenceEmbedding.js";
import { saveEmbedding } from "../vectorstore/neo4jVectorStore.js";

export async function ingestPdf(path: string) {
  const parts = await loadDocument(path);
  for (const p of parts) {
    const emb = await embedHF(p);
    await saveEmbedding(p, emb);
  }
}