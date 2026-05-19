export async function askQuestion(question: string) {
  const res = await fetch("http://localhost:3000/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  if (!res.ok) {
    throw new Error("Erro ao consultar o backend.");
  }

  return res.json();
}