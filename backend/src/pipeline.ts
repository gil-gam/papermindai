import { embeddings } from "./config.js";
import { chatModel } from "./openRouter.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const prompt = ChatPromptTemplate.fromTemplate(`
  Você é um assistente útil. Responda baseado no contexto abaixo.
  Contexto: {context}
  Pergunta: {question}
`);

const chain = prompt.pipe(chatModel).pipe(new StringOutputParser());

export { embeddings, splitter, chain };
