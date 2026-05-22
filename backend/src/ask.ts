import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import { pipeline } from "@xenova/transformers";
import OpenAI from "openai";

dotenv.config();

export interface AskResponse {
  resposta: string;
  fontes: Array<{ file: string; page: number }>;
}

export async function ask(question: string): Promise<AskResponse> {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const embeddingTensor = await extractor(question, { pooling: "mean", normalize: true });
  const embedding = Array.from(embeddingTensor.data);

  const driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
  );
  const session = driver.session();

  const result = await session.run(
    `
    MATCH (c:Chunk)
    WITH c, gds.similarity.cosine(c.embedding, $queryVec) AS score
    RETURN c.text AS text, c.source AS source, c.page AS page, score
    ORDER BY score DESC LIMIT 5
    `,
    { queryVec: embedding }
  );

  const chunks = result.records.map(r => ({
    text: r.get("text"),
    source: r.get("source"),
    page: r.get("page")
  }));

  const context = chunks.map(c => c.text).join("\n\n");

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL,
      "X-Title": process.env.OPENROUTER_SITE_NAME
    }
  });

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL!,
    messages: [
      { role: "system", content: "Responda com base SOMENTE no contexto fornecido." },
      { role: "user", content: `Contexto:\n${context}\n\nPergunta: ${question}` }
    ]
  });

  const resposta = completion.choices[0]?.message?.content ?? "Erro ao gerar resposta.";

  await session.close();
  await driver.close();

  return {
    resposta,
    fontes: chunks.map(c => ({ file: c.source, page: c.page }))
  };
}
