import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    const res = await fetch("http://localhost:3000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (data.resposta) {
      setAnswer(data.resposta);
    } else if (data.error) {
      setAnswer("Erro: " + data.error);
    } else {
      setAnswer("Resposta inesperada.");
    }
  };

  return (
    <div>
      <h2>Assistente RAG para dúvidas da pós-graduação em Engenharia de Software com IA</h2>
      <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Faça sua pergunta" />
      <button onClick={handleAsk}>Perguntar</button>
      <p>{answer}</p>
    </div>
  );
}

export default App;
