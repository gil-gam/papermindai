import { embedHF } from "../embeddings/hfInferenceEmbedding.js";
import { similaritySearch } from "../vectorstore/neo4jVectorStore.js";

export async function retrieve(query: string, topK = 5) {
  const embedding = await embedHF(query);
  const results = await similaritySearch(embedding, topK);
  return results.map(r => r.text).join("\n\n");
}