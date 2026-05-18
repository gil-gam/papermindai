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
  }
};