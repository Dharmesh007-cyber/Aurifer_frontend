"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, Code, Info, Link as LinkIcon, Mic, Paperclip, Send, X } from "lucide-react";

export function FloatingAiAssistant() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, maxChars));
  };

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (chatRef.current && !chatRef.current.contains(target) && !target.closest(".floating-ai-button")) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        className={`floating-ai-button relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 ${
          isChatOpen ? "rotate-90" : "rotate-0"
        }`}
        onClick={() => setIsChatOpen((open) => !open)}
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)",
          boxShadow:
            "0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(124, 58, 237, 0.5), 0 0 60px rgba(109, 40, 217, 0.3)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30" />
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="relative z-10">{isChatOpen ? <X /> : <Bot className="h-8 w-8 text-white" />}</div>
        <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 animate-ping" />
      </button>

      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-[min(500px,calc(100vw-2rem))] origin-bottom-right"
          style={{ animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-zinc-500/50 bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 shadow-2xl backdrop-blur-3xl">
            <div className="flex items-center justify-between px-6 pb-2 pt-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-2xl bg-zinc-800/60 px-2 py-1 text-xs font-medium text-zinc-300">
                  GPT-4
                </span>
                <span className="rounded-2xl border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                  Pro
                </span>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-full p-1.5 transition-colors hover:bg-zinc-700/50"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={4}
                className="min-h-[120px] w-full resize-none border-none bg-transparent px-6 py-4 text-base leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder="What would you like to explore today? Ask anything, share ideas, or request assistance..."
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-800/5 to-transparent" />
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-1">
                    {[Paperclip, LinkIcon, Code].map((Icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className="rounded-lg p-2.5 text-zinc-500 transition-all duration-300 hover:scale-105 hover:bg-zinc-800/80 hover:text-zinc-200"
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                    <button
                      type="button"
                      className="rounded-lg p-2.5 text-zinc-500 transition-all duration-300 hover:scale-105 hover:bg-zinc-800/80 hover:text-purple-400"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148zm7.704 0c-2.476 0-4.49 2.015-4.49 4.49s2.014 4.49 4.49 4.49 4.49-2.015 4.49-4.49-2.014-4.49-4.49-4.49zm0 7.509c-1.665 0-3.019-1.355-3.019-3.019s1.355-3.019 3.019-3.019 3.019 1.354 3.019 3.019-1.354 3.019-3.019 3.019zM8.148 24c-2.476 0-4.49-2.015-4.49-4.49s2.014-4.49 4.49-4.49h4.588V24H8.148zm3.117-1.471V16.49H8.148c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.02 3.019 3.02h3.117z" />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-zinc-700/30 p-2.5 text-zinc-500 transition-all duration-300 hover:scale-110 hover:border-red-500/30 hover:bg-zinc-800/80 hover:text-red-400"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-zinc-500">
                    {message.length}/{maxChars}
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="group relative rounded-xl bg-gradient-to-r from-red-600 to-red-500 p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-500 hover:to-red-400"
                  >
                    <Send className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-6 border-t border-zinc-800/50 pt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  <span>Press Shift + Enter for new line</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent, rgba(147, 51, 234, 0.05))",
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.9), 0 0 50px rgba(124, 58, 237, 0.7),
            0 0 70px rgba(109, 40, 217, 0.5);
        }
      `}</style>
    </div>
  );
}
