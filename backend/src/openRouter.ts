import { ChatOpenAI } from "@langchain/openai";

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  model: "openai/gpt-4o-mini",
});

export { chatModel };
