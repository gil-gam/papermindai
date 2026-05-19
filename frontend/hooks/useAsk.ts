import { useState } from "react";

export function useAsk() {
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      return await res.json();
    } finally {
      setLoading(false);
    }
  }

  return { ask, loading };
}