import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

const graph = await Neo4jGraph.initialize({
  url: process.env.NEO4J_URI!,
  username: process.env.NEO4J_USER!,
  password: process.env.NEO4J_PASSWORD!,
});

await graph.query(`
  CREATE CONSTRAINT IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE;
  CREATE INDEX IF NOT EXISTS FOR (d:Document) ON (d.embedding);
  CREATE CONSTRAINT IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE;
  CREATE INDEX IF NOT EXISTS FOR (c:Chunk) ON (c.embedding);
`);

export { graph };

