import { type Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

type DebugLog = (...args: unknown[]) => void;

export interface PromptConstraints {
  tone: string;
  language: string;
  format: string;
}

export interface PromptConfig {
  role: string;
  task: string;
  instructions: string[];
  constraints: PromptConstraints;
}

export interface ChainState {
  question: string;
  context?: string;
  topScore?: number;
  answer?: string;
  error?: string;
}

export interface AIParams {
  debugLog: DebugLog;
  vectorStore: Neo4jVectorStore;
  nlpModel: ChatOpenAI;
  promptConfig: any;
  templateText: string;
  topK: number;
}

export class AI {
  public params: {
    debugLog: DebugLog;
    vectorStore: Neo4jVectorStore;
    nlpModel: ChatOpenAI;
    promptConfig: PromptConfig;
    templateText: string;
    topK: number;
  };

  constructor(raw: AIParams) {
    this.params = {
      debugLog: raw.debugLog,
      vectorStore: raw.vectorStore,
      nlpModel: raw.nlpModel,
      templateText: raw.templateText,
      topK: raw.topK,
      promptConfig: {
        role: raw.promptConfig?.role ?? "assistant",
        task: raw.promptConfig?.task ?? "",
        instructions: Array.isArray(raw.promptConfig?.instructions) ? raw.promptConfig.instructions : [],
        constraints: {
          tone: raw.promptConfig?.constraints?.tone ?? "default",
          language: raw.promptConfig?.constraints?.language ?? "pt",
          format: raw.promptConfig?.constraints?.format ?? "text"
        }
      }
    };
  }

  async retrieveVectorSearchResults(input: ChainState): Promise<ChainState> {
    this.params.debugLog("🔍 Buscando no vector store (Neo4j)…");

    const vectorResults = await this.params.vectorStore.similaritySearchWithScore(
      input.question,
      this.params.topK
    );

    if (!vectorResults || vectorResults.length === 0) {
      return {
        ...input,
        error: "Não encontrei informação suficiente na base para responder à pergunta."
      };
    }

    const firstPair = vectorResults[0];
    if (!firstPair) {
      return {
        ...input,
        error: "Não encontrei informação suficiente na base para responder à pergunta."
      };
    }

    const [, firstScore] = firstPair;
    if (firstScore === undefined) {
      return {
        ...input,
        error: "Não encontrei informação suficiente na base para responder à pergunta."
      };
    }

    const filtered = vectorResults.filter((pair) => {
      if (!pair) return false;
      const score = pair[1];
      return score !== undefined && score > 0.5;
    });

    const finalList = filtered.length > 0 ? filtered : vectorResults;

    const context = finalList
      .map((pair) => {
        if (!pair) return "";
        const [doc] = pair;
        const page = doc?.metadata?.pageNumber ?? "N/A";
        return `Página ${page}:\n${doc.pageContent}`;
      })
      .join("\n\n---\n\n");

    return {
      ...input,
      context,
      topScore: firstScore
    };
  }

  async generateNLPResponse(input: ChainState): Promise<ChainState> {
    if (input.error) return input;

    this.params.debugLog("🤖 Gerando resposta com LLM…");

    const prompt = ChatPromptTemplate.fromTemplate(this.params.templateText);

    const chain = prompt
      .pipe(this.params.nlpModel)
      .pipe(new StringOutputParser());

    const raw = await chain.invoke({
      role: this.params.promptConfig.role,
      task: this.params.promptConfig.task,
      tone: this.params.promptConfig.constraints.tone,
      language: this.params.promptConfig.constraints.language,
      format: this.params.promptConfig.constraints.format,
      instructions: this.params.promptConfig.instructions
        .map((t, i) => `${i + 1}. ${t}`)
        .join("\n"),
      question: input.question,
      context: input.context ?? ""
    });

    return {
      ...input,
      answer: raw
    };
  }

  async answerQuestion(question: string): Promise<ChainState> {
    const chain = RunnableSequence.from([
      this.retrieveVectorSearchResults.bind(this),
      this.generateNLPResponse.bind(this)
    ]);

    const result = await chain.invoke({ question });

    this.params.debugLog("\n🎙️ Pergunta:");
    this.params.debugLog(question, "\n");

    this.params.debugLog("💬 Resposta:");
    this.params.debugLog(result.answer || result.error, "\n");

    return result;
  }
}