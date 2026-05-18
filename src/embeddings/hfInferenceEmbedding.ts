import { HfInference } from "@huggingface/inference";

const hf = new HfInference("");

export async function embedHF(text: string) {
  const res = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text
  });
  return res[0];
}