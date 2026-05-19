import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  role: "user" | "ai";
  text: string;
};

export function Message({ role, text }: Props) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex items-end gap-2 max-w-[80%] animate-fadeInUp">

        {/* Avatar da IA */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            AI
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <div
          className={`
            px-4 py-2 rounded-xl text-sm shadow-sm prose prose-sm dark:prose-invert
            ${isUser
              ? "bg-[var(--pm-primary)] text-white rounded-br-none ml-auto"
              : `
                  bg-[var(--pm-paper)] dark:bg-[var(--pm-paper-dark)]
                  text-zinc-900 dark:text-zinc-100
                  rounded-bl-none ai-pulse
                `
            }
          `}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
        </div>

        {/* Avatar do Usuário */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-zinc-400 flex items-center justify-center text-white font-bold">
            U
          </div>
        )}

      </div>
    </div>
  );
}