import { Header } from "./components/Header";
import { ChatBox } from "./components/ChatBox";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-paper dark:bg-paperDark">
      <Header />

      <div
        className="
          w-full h-full sm:h-[92vh] sm:max-w-2xl 
          bg-white dark:bg-zinc-900 
          shadow-lg rounded-none sm:rounded-xl
          border border-zinc-200 dark:border-zinc-700
          overflow-hidden
          pt-[60px]
        "
      >
        <ChatBox />
      </div>
    </div>
  );
}