export function Header() {
  return (
    <header
      className="
        w-full fixed top-0 left-0 z-10
        h-16
        px-6
        flex items-center
        backdrop-blur-xl
        bg-[var(--pm-paper)/80] dark:bg-[var(--pm-paper-dark)/75]
        border-b border-zinc-200 dark:border-zinc-700
        shadow-sm
      "
    >
      {/* Ícone */}
      <div
        className="
          w-9 h-9 rounded-xl
          bg-blue-600/90 dark:bg-blue-500/90
          flex items-center justify-center
          text-lg text-white select-none
          shadow-sm
        "
      >
        🤖
      </div>

      {/* Marca */}
      <div className="flex flex-col ml-3 leading-tight">
        <h1 className="text-[1.2rem] font-semibold text-zinc-800 dark:text-zinc-100">
          PaperMind AI
        </h1>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Intelligent Workspace Assistant
        </span>
      </div>
    </header>
  );
}