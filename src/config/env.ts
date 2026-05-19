import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SearchType } from "@langchain/community/vectorstores/neo4j_vector";

function loadTemplate(): string {
  const templatePath = join(process.cwd(), "prompts", "template.txt");
  return existsSync(templatePath)
    ? readFileSync(templatePath, "utf8")
    : "";
}

function loadPromptConfig(): any {
  const configPath = join(process.cwd(), "prompts", "answerPrompt.json");
  return existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, "utf8"))
    : {};
}

export const CONFIG = {
  openRouter: {
    url: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    nlpModel: process.env.NLP_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    maxRetries: 2,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "localhost",
      "X-Title": process.env.OPENROUTER_SITE_NAME || "RAG-System"
    }
  },

  pdf: {
    folder: "./files"
  },

  textSplitter: {
    chunkSize: 1000,
    chunkOverlap: 200
  },

  embedding: {
    modelName: "sentence-transformers/all-MiniLM-L6-v2",
    pretrainedOptions: {
      revision: "main"
    }
  },

  similarity: {
    topK: 3
  },

  neo4j: {
    url: process.env.NEO4J_URI || "",
    username: process.env.NEO4J_USERNAME || "neo4j",
    password: process.env.NEO4J_PASSWORD || "",
    indexName: "vector",
    searchType: SearchType.VECTOR,
    textNodeProperties: ["pageContent"],
    nodeLabel: "Chunk"
  },

  output: {
    answersFolder: "./output/answers",
    fileName: "last-answer.txt"
  },

  promptConfig: loadPromptConfig(),
  templateText: loadTemplate()
};