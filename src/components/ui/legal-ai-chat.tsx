"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Bot,
  CheckCircle2,
  Command,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  User2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Message = { id: string; role: "assistant" | "user"; text: string };

type Props = {
  className?: string;
  fullHeight?: boolean;
  title?: string;
  subtitle?: string;
  inputPlaceholder?: string;
  initialMessages?: Message[];
};

const COMMANDS = ["/clause", "/summary", "/review", "/improve"];
const PROMPTS = [
  "Review this vendor agreement for indemnity risk",
  "Summarize the latest GST draft for the client",
  "List missing exhibits before export",
];
const SEED: Message[] = [
  { id: "a1", role: "assistant", text: "Workspace synced. Ask for a draft, review, or filing summary." },
  { id: "a2", role: "assistant", text: "Attachments are folded into each reply, so you can test the full chatbot flow here." },
];

function buildReply(input: string, attachments: string[]) {
  const q = input.toLowerCase();
  const suffix = attachments.length ? `\n\nLoaded context: ${attachments.join(", ")}.` : "";
  if (q.includes("indemnity") || q.startsWith("/review")) return `Risk review complete.\n\n1. Indemnity is one-sided and uncapped.\n2. Liability does not exclude regulatory penalties.\n3. Termination needs a cure period.${suffix}`;
  if (q.includes("gst") || q.includes("vat") || q.startsWith("/summary")) return `Draft filing summary prepared.\n\n1. Tax period and client identifiers are aligned.\n2. Liability totals need one source check.\n3. Export can start after finance approval.${suffix}`;
  if (q.includes("contract") || q.includes("clause") || q.startsWith("/clause")) return `Clause pack generated.\n\nIncluded: confidentiality, data handling, liability cap, dispute resolution, and post-termination cooperation.${suffix}`;
  if (q.includes("rewrite") || q.startsWith("/improve")) return `Draft improved.\n\nI tightened the legal language, reduced repetition, and converted vague obligations into measurable actions.${suffix}`;
  return `I mapped your request into the current matter workspace.\n\nRecommended next steps:\n1. Pull the latest source files.\n2. Generate a concise draft for legal review.\n3. Prepare the export bundle after sign-off.${suffix}`;
}

export function AnimatedAIChat({
  className,
  fullHeight = false,
  title = "AI matter assistant",
  subtitle = "Review, summarize, and draft directly inside the workspace.",
  inputPlaceholder = "Ask about a filing, contract, or review note...",
  initialMessages = SEED,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const send = () => {
    const text = value.trim();
    if (!text || typing) return;
    const userText = attachments.length ? `${text}\n\nAttached: ${attachments.join(", ")}` : text;
    const nextAttachments = attachments;
    startTransition(() => {
      setMessages((current) => [...current, { id: `u-${Date.now()}`, role: "user", text: userText }]);
      setValue("");
      setAttachments([]);
      setTyping(true);
      setShowCommands(false);
    });
    timeoutRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, { id: `a-${Date.now()}`, role: "assistant", text: buildReply(text, nextAttachments) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-[2rem] border border-slate-800/80 bg-[#050816] text-white shadow-[0_40px_100px_rgba(2,8,23,0.48)]", fullHeight ? "min-h-[calc(100vh-7rem)]" : "min-h-[720px]", className)}>
      <div className="border-b border-white/8 px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-sky-200 uppercase">
          <Sparkles className="size-3.5" />
          Live assistant
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PROMPTS.map((prompt) => (
            <button key={prompt} type="button" onClick={() => setValue(prompt)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:border-sky-400/30 hover:bg-white/[0.06] hover:text-white">
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-200"><Bot className="size-4.5" /></div>}
            <div className={cn("max-w-[88%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 whitespace-pre-line", message.role === "assistant" ? "border border-white/10 bg-white/[0.04] text-white/85" : "bg-sky-400 text-slate-950")}>
              {message.text}
            </div>
            {message.role === "user" && <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/70"><User2 className="size-4.5" /></div>}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-200"><Bot className="size-4.5" /></div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">Thinking...</div>
          </div>
        )}
      </div>

      <div className="border-t border-white/8 px-6 py-5">
        {(showCommands || value.startsWith("/")) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {COMMANDS.map((command) => (
              <button key={command} type="button" onClick={() => { setValue(`${command} `); textareaRef.current?.focus(); }} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:border-sky-400/30 hover:bg-white/[0.06] hover:text-white">
                {command}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder={inputPlaceholder}
            className="min-h-[60px] w-full resize-none rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 pr-32 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-sky-400/60 focus:bg-white/[0.05]"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button type="button" onClick={() => setAttachments((current) => [...current, `matter-${Math.floor(Math.random() * 90 + 10)}.pdf`])} className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-sky-400/30 hover:text-white"><Paperclip className="size-4" /></button>
            <button type="button" onClick={() => setShowCommands((current) => !current)} className={cn("flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-sky-400/30 hover:text-white", (showCommands || value.startsWith("/")) && "border-sky-400/30 text-white")}><Command className="size-4" /></button>
            <button type="button" onClick={send} disabled={typing || isPending || !value.trim()} className={cn("flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-medium transition", value.trim() ? "bg-sky-400 text-slate-950" : "bg-white/[0.06] text-white/35")}>
              {typing || isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={`${attachment}-${index}`} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                <CheckCircle2 className="size-3.5 text-emerald-300" />
                <span>{attachment}</span>
                <button type="button" onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-white/40 transition hover:text-white"><X className="size-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
