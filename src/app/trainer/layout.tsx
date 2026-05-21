import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import AiChatbot from "@/components/ai-chatbot";
import AuthGuard from "@/components/auth-guard";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard role="trainer">
      <div className="app-bg min-h-screen text-slate-100">
        <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
          <Sidebar role="trainer" />
          <div className="flex min-h-screen flex-1 flex-col">
            <TopBar role="trainer" />
            <div className="flex flex-1 gap-6 px-6 pb-10 pt-4">
              <main className="flex-1 space-y-6">{children}</main>
            </div>
          </div>
        </div>
        <AiChatbot role="trainer" />
      </div>
    </AuthGuard>
  );
}
