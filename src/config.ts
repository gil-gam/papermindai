import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/* ----------------------- PROMPT FILES ------------------------- */

const promptsFolder = "./prompts";

const promptsFiles = {
  answerPrompt: `${promptsFolder}/answerPrompt.json`,
  template: `${promptsFolder}/template.txt`
};

/* ----------------------- TEXT SPLITTER ------------------------- */

export interface TextSplitterConfig {
  chunkSize: number;
  chunkOverlap: number;
}

/* ----------------------- CONFIG CORE --------------------------- */

export const CONFIG = Object.freeze({
  promptConfig: JSON.parse(readFileSync(promptsFiles.answerPrompt, "utf-8")),
  templateText: readFileSync(promptsFiles.template, "utf-8"),

  output: {
    answersFolder: "./answers",
    fileName: "answer"
  },

  neo4j: {
    url: process.env.NEO4J_URI || "bolt://localhost:7687",
    username: process.env.NEO4J_USER || "neo4j",
    password: process.env.NEO4J_PASSWORD || "password",
    indexName: "tensors_index",
    searchType: "vector" as const,
    textNodeProperties: ["text"],
    nodeLabel: "Chunk"
  },

  openRouter: {
    nlpModel: process.env.NLP_MODEL || "gpt-4o-mini",
    url: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    temperature: 0.3,
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
      dtype: "fp32"
    }
  },

  similarity: {
    topK: 3
  }
});

/* ----------------------- PDF UTIL ----------------------------- */

export function getPdfFiles(): string[] {
  const folder = CONFIG.pdf.folder;

  if (!existsSync(folder)) {
    console.warn(`[WARN] Pasta de PDFs não encontrada: "${folder}"`);
    return [];
  }

  const files = readdirSync(folder);

  const pdfs = files
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .map((f) => join(folder, f));

  if (pdfs.length === 0) {
    console.warn(`[WARN] Nenhum arquivo .pdf encontrado em "${folder}"`);
  }

  return pdfs;
}