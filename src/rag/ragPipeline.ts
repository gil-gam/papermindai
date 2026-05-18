import { retrieve } from "./retriever.js";

export async function ragPipeline(query: string) {
  const context = await retrieve(query);
  return { context };
}