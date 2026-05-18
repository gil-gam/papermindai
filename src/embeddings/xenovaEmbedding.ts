import { pipeline } from "@xenova/transformers";

export async function embedXenova(text: string) {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const output = await extractor(text);
  return Array.from(output.data);
}