type Props = {
  onSelect: (question: string) => void;
};

export function Suggestions({ onSelect }: Props) {
  const suggestions = [
    "Explique esse conceito com um exemplo real.",
    "Resuma este conteúdo de forma simples.",
    "Quais são os pontos mais importantes?",
    "Me dê uma explicação técnica detalhada.",
    "Crie um diagrama mental sobre o assunto."
  ];

  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          className="
            bg-zinc-100 dark:bg-zinc-800 
            px-3 py-1 rounded-lg text-sm
            border border-zinc-200 dark:border-zinc-700
            hover:bg-zinc-200 dark:hover:bg-zinc-700 transition
          "
        >
          {s}
        </button>
      ))}
    </div>
  );
}