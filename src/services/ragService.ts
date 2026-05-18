import { ragPipeline } from "../rag/ragPipeline.js";
import { ChatOpenAI } from "@langchain/openai";
import { CONFIG } from "../config/env.js";

export async function rag(query: string) {
  const { context } = await ragPipeline(query);

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

  const prompt = `
Contexto:
${context}

Pergunta:
${query}

Responda de forma direta e clara usando apenas o contexto acima.
`.trim();

  const response = await llm.invoke(prompt);
  return response;
}