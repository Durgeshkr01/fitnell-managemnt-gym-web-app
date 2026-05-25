"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AiChatbotProps = {
  role: "admin" | "trainer" | "member";
};

const buildWelcomeMessage = (role: AiChatbotProps["role"]): ChatMessage => {
  const base =
    "Hi! Main SG Fitness AI hoon. Aap plan/diet banwana chahte ho ya koi question hai? Details share kar do.";

  if (role === "member") {
    return {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! Main SG Fitness AI hoon. Aap apne plan, diet, ya routine ke baare me puch sakte ho. Kya help chahiye?",
    };
  }

  return {
    id: "welcome",
    role: "assistant",
    content: base,
  };
};


export default function AiChatbot({ role }: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([buildWelcomeMessage(role)]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    if (role === "admin") return "Admin AI Coach";
    if (role === "trainer") return "Trainer AI Coach";
    return "Member AI Coach";
  }, [role]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      if (!response.ok) {
        let errorMessage = "AI request failed.";
        try {
          const errorPayload = (await response.json()) as {
            error?: string;
            detail?: string;
          };
          errorMessage =
            errorPayload.detail || errorPayload.error || errorMessage;
        } catch {
          // Keep default message for non-JSON errors.
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply || "Sorry, reply generate nahi hua. Dobara try karein.",
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Network issue lag raha hai. Thoda baad try karein.";
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="glass-panel-strong w-[360px] rounded-2xl border border-white/10 p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-slate-400">
                Plan, diet aur Q&A sab ek jagah
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:text-white"
            >
              Close
            </button>
          </div>

          <div
            ref={listRef}
            className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "assistant"
                    ? "rounded-2xl bg-white/5 p-3 text-sm text-slate-200"
                    : "rounded-2xl bg-blue-500/20 p-3 text-sm text-white"
                }
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {isLoading ? (
              <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-400">
                Typing...
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your request"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="button"
              onClick={sendMessage}
              className="rounded-xl border border-blue-500/40 bg-blue-500/20 px-3 py-2 text-sm text-white hover:bg-blue-500/30"
            >
              Send
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.25em] text-white shadow-lg"
      >
        AI Coach
      </button>
    </div>
  );
}
