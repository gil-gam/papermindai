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

interface Props {
  sessions: Session[];
  activeSession: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function Sidebar({ sessions, activeSession, onSelect, onDelete, onNew }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 z-40 bg-white dark:bg-zinc-900 border-r border-zinc-300 dark:border-zinc-700 p-5 overflow-y-auto shadow-xl">
      {/* Título */}
      <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
        Conversas
      </h2>

      {/* Nova conversa */}
      <button
        onClick={onNew}
        className="w-full mb-5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition"
      >
        + Nova conversa
      </button>

      {/* Sem conversas */}
      {sessions.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhuma conversa salva ainda.</p>
      )}

      {/* Lista de conversas */}
      <ul className="space-y-3">
        {sessions.map(session => {
          const isActive = session.id === activeSession;
          return (
            <li
              key={session.id}
              className={`relative rounded-lg p-4 cursor-pointer border transition group ${
                isActive
                  ? "bg-blue-600 border-blue-700 text-white shadow-md"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              onClick={() => onSelect(session.id)}
            >
              {/* Título */}
              <div className="font-medium text-sm">
                {session.title || "Conversa sem título"}
              </div>

              {/* Última atualização */}
              <div
                className={`text-xs mt-1 ${
                  isActive ? "text-blue-100" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Atualizada em:{" "}
                {new Date(session.updatedAt).toLocaleString("pt-BR")}
              </div>

              {/* Botão excluir */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className={`absolute right-2 top-2 px-2 py-1 text-xs rounded-md transition ${
                  isActive
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Excluir
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}