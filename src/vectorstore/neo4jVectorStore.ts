import { driver } from "../config/neo4j.js";

export async function saveEmbedding(text: string, embedding: number[]) {
  const session = driver.session();
  await session.run(
    "CREATE (n:Chunk { text: $text, embedding: $embedding })",
    { text, embedding }
  );
  await session.close();
}

export async function similaritySearch(queryEmbedding: number[], topK = 5) {
  const session = driver.session();
  const res = await session.run(
    `
    MATCH (n:Chunk)
    WITH n,
      gds.similarity.cosine(n.embedding, $embedding) AS score
    RETURN n.text AS text, score
    ORDER BY score DESC
    LIMIT $limit
    `,
    { embedding: queryEmbedding, limit: topK }
  );
  await session.close();
  return res.records.map(r => ({
    text: r.get("text"),
    score: r.get("score")
  }));
}