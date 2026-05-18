import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChatOpenAI } from "@langchain/openai";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { DocumentProcessor } from "./documentProcessor.js";
import { AI } from "./ai.js";
import { CONFIG } from "./config/env.js";
import { mkdir, writeFile } from "node:fs/promises";
import { type PretrainedOptions } from "@huggingface/transformers";

let _neo4jVectorStore: Neo4jVectorStore | null = null;

async function clearAll(store: Neo4jVectorStore, label: string) {
  await store.query(`MATCH (n:\`${label}\`) DETACH DELETE n`);
}

async function main() {
  const processor = new DocumentProcessor(CONFIG.textSplitter);
  const documents = await processor.loadAndSplit();

  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: CONFIG.embedding.modelName,
    pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions
  });

  const llm = new ChatOpenAI({
    temperature: CONFIG.openRouter.temperature,
    maxRetries: CONFIG.openRouter.maxRetries,
    modelName: CONFIG.openRouter.nlpModel,
    openAIApiKey: CONFIG.openRouter.apiKey,
    configuration: {
      baseURL: CONFIG.openRouter.url,
      defaultHeaders: CONFIG.openRouter.defaultHeaders
    }
  });

  _neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(
    embeddings,
    CONFIG.neo4j
  );

  await clearAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel);

  for (const doc of documents) {
    await _neo4jVectorStore.addDocuments([doc]);
  }

  const ai = new AI({
    nlpModel: llm,
    debugLog: console.log,
    vectorStore: _neo4jVectorStore,
    promptConfig: CONFIG.promptConfig,
    templateText: CONFIG.templateText,
    topK: CONFIG.similarity.topK
  });

  await mkdir(CONFIG.output.answersFolder, { recursive: true });

  console.log("Sistema pronto. Aguardando perguntas externas.");
}

main().catch(console.error).finally(async () => {
  await _neo4jVectorStore?.close();
});