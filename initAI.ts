import { ChatOpenAI } from "@langchain/openai";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { PretrainedOptions } from "@huggingface/transformers";
import { AI } from "./src/ai.js";
import { CONFIG } from "./src/config/env.js";

export async function initAI() {
  // 1. Embeddings (MiniLM - escolha oficial do projeto)
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions
  });

  // 2. LLM configurado com OpenRouter (para resposta final do RAG)
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

  // 3. Conectar ao Neo4jVectorStore existente
  const vectorStore = await Neo4jVectorStore.fromExistingGraph(
    embeddings,
    CONFIG.neo4j
  );

  // 4. Criar instância central da IA
  return new AI({
    nlpModel: llm,
    debugLog: console.log,
    vectorStore,
    promptConfig: CONFIG.promptConfig,
    templateText: CONFIG.templateText,
    topK: CONFIG.similarity.topK
  });
}