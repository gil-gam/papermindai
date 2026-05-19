import { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { Typing } from "./Typing";
import { Suggestions } from "./Suggestions";
import { Sidebar } from "./Sidebar";
import { askQuestion } from "../api/ask";
import { v4 as uuid } from "uuid";

interface Msg {
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Msg[];
}

export function ChatBox() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ------------------------------
  // 1) CARREGAR SESSÕES
  // ------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("chat_sessions");
    const active = localStorage.getItem("active_session_id");
    if (saved) setSessions(JSON.parse(saved));
    if (active) setActiveSession(active);
  }, []);

  // ------------------------------
  // 2) PERSISTIR + AUTOSCROLL
  // ------------------------------
  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    if (activeSession) {
      localStorage.setItem("active_session_id", activeSession);
    }
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [sessions, activeSession]);

  // ------------------------------
  // 3) SESSÃO ATIVA
  // ------------------------------
  const active = sessions.find((s) => s.id === activeSession);

  // ------------------------------
  // 4) NOVA SESSÃO
  // ------------------------------
  function handleNewSession() {
    const id = uuid();
    const now = new Date().toISOString();
    const newSession: Session = {
      id,
      title: "Nova conversa",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSession(id);
  }

  // ------------------------------
  // 5) DELETAR SESSÃO
  // ------------------------------
  function handleDeleteSession(id: string) {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSession === id) {
      setActiveSession(filtered.length > 0 ? filtered[0].id : null);
    }
  }

  // ------------------------------
  // 6) SELECIONAR SESSÃO
  // ------------------------------
  function handleSelectSession(id: string) {
    setActiveSession(id);
    setShowSidebar(false);
  }

  // ------------------------------
  // 7) ENVIAR MENSAGEM  (CORRIGIDO)
  // ------------------------------
  async function handleSend() {
    if (!input.trim()) return;

    const timestamp = new Date().toISOString();
    let currentSessions = sessions;
    let currentId = activeSession;

    // Cria sessão inline se não houver uma ativa
    if (!currentId) {
      currentId = uuid();
      const now = timestamp;
      const newSession: Session = {
        id: currentId,
        title: "Nova conversa",
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      currentSessions = [...sessions, newSession];
      setSessions(currentSessions);
      setActiveSession(currentId);
    }

    // Mensagem do usuário
    const userUpdate = currentSessions.map((s) =>
      s.id === currentId
        ? {
            ...s,
            updatedAt: timestamp,
            messages: [...s.messages, { role: "user", text: input, timestamp }],
            title:
              s.messages.length === 0
                ? input.slice(0, 40) + "..."
                : s.title,
          }
        : s
    );

    setSessions(userUpdate);
    setInput("");
    setLoading(true);

    // Resposta da IA
    try {
      const res = await askQuestion(input);
      const aiText = res.answer || res.error;

      const aiUpdate = userUpdate.map((s) =>
        s.id === currentId
          ? {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [
                ...s.messages,
                {
                  role: "ai",
                  text: aiText,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : s
      );

      setSessions(aiUpdate);
    } catch {
      const errorUpdate = userUpdate.map((s) =>
        s.id === currentId
          ? {
              ...s,
              messages: [
                ...s.messages,
                {
                  role: "ai",
                  text: "Erro ao consultar o servidor.",
                  timestamp,
                },
              ],
            }
          : s
      );

      setSessions(errorUpdate);
    }

    setLoading(false);
  }

  // ------------------------------
  // 8) UPLOAD DE PDF  (CORRIGIDO)
  // ------------------------------
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const timestamp = new Date().toISOString();
    let currentSessions = sessions;
    let currentId = activeSession;

    // Cria sessão inline se não houver uma ativa
    if (!currentId) {
      currentId = uuid();
      const now = timestamp;
      const newSession: Session = {
        id: currentId,
        title: "Nova conversa",
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      currentSessions = [...sessions, newSession];
      setSessions(currentSessions);
      setActiveSession(currentId);
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("http://localhost:3000/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const msg = `PDF "${file.name}" enviado com sucesso! Ingerindo conteúdo...`;

      const updated = currentSessions.map((s) =>
        s.id === currentId
          ? {
              ...s,
              updatedAt: timestamp,
              messages: [...s.messages, { role: "ai", text: msg, timestamp }],
            }
          : s
      );

      setSessions(updated);
    } catch {
      const errorUpdate = currentSessions.map((s) =>
        s.id === currentId
          ? {
              ...s,
              messages: [
                ...s.messages,
                {
                  role: "ai",
                  text: "Erro ao enviar o PDF.",
                  timestamp,
                },
              ],
            }
          : s
      );

      setSessions(errorUpdate);
      console.error("Erro ao enviar PDF.");
    }

    // Reset do input file
    e.target.value = "";
    setLoading(false);
  }

  // ------------------------------
  // 9) RENDER
  // ------------------------------
  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Botão da sidebar */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute left-2 top-2 z-20 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-md"
      >
        📜
      </button>

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          sessions={sessions}
          activeSession={activeSession}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
          onNew={handleNewSession}
        />
      )}

      {/* Sugestões */}
      <Suggestions onSelect={setInput} />

      {/* Área de mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 bg-white dark:bg-zinc-900"
      >
        {active?.messages.map((m, i) => (
          <Message key={i} role={m.role} text={m.text} />
        ))}
        {loading && <Typing />}
      </div>

      {/* Barra inferior */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 flex items-center gap-2 bg-white dark:bg-zinc-900">
        {/* Input PDF oculto */}
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfUpload}
        />

        {/* Botão PDF */}
        <label
          htmlFor="pdf-upload"
          className="px-3 py-2 rounded-lg text-sm cursor-pointer bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
        >
          PDF
        </label>

        {/* Campo de texto */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite sua pergunta..."
        />

        {/* Botão Enviar */}
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}