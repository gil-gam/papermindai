export function Typing() {
  return (
    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm px-3 py-2">
      <span>Digitando</span>
      <span className="flex gap-1">
        <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
        <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
      </span>
    </div>
  );
}