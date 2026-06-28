"use client";

import { motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import * as React from "react";
import { Container } from "@/components/ui/container";
import {
  AI_CAPABILITIES,
  getReply,
  SEED_CONVERSATION,
  type ChatMessage,
} from "@/lib/assistant-data";
import { cn } from "@/lib/utils";
import { getDoctor } from "@/lib/doctors";
import { getClinic } from "@/lib/clinics";
import { DoctorCard } from "@/components/sections/doctors/doctor-card";
import { ClinicCard } from "@/components/sections/clinics/clinic-card";

let idCounter = 0;
const nextId = () => `msg-${++idCounter}`;

export function AssistantChat({
  initialPrompt,
}: {
  /** When set, this message is auto-sent once as the first user turn. */
  initialPrompt?: string;
} = {}) {
  const [messages, setMessages] =
    React.useState<ChatMessage[]>(SEED_CONVERSATION);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = React.useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", content: trimmed },
    ]);
    setInput("");
    setThinking(true);

    // Simulate the assistant "thinking" then responding (no backend).
    const { reply, suggestions, recommendations } = getReply(trimmed);
    window.setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: reply, suggestions, recommendations },
      ]);
    }, 900);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  // Auto-send the pre-filled prompt once (e.g. arriving from a Hero chip).
  const firedInitial = React.useRef(false);
  React.useEffect(() => {
    if (initialPrompt && !firedInitial.current) {
      firedInitial.current = true;
      send(initialPrompt);
    }
  }, [initialPrompt, send]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f6f3ff] via-soft-bg to-white">
      {/* soft AI aura in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ai/10 blur-3xl"
      />
      <Container size="app" className="relative grid gap-8 py-10 lg:grid-cols-[1fr_320px] lg:py-14">
        {/* ---------------- Chat column ---------------- */}
        <div className="flex h-[calc(100vh-9rem)] min-h-[560px] flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-ai/15 bg-white shadow-[var(--shadow-large)]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border-soft bg-gradient-to-r from-ai/8 to-transparent px-5 py-4">
            <span className="ai-glow inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ai to-ai-light text-white">
              <Bot className="h-5.5 w-5.5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg font-bold tracking-tight text-navy">
                AI Health Assistant
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                Online · powered by HelixHealth AI
              </p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-ai/10 px-3 py-1 text-xs font-semibold text-ai sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" /> Smart
            </span>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onSuggestion={send} />
            ))}
            {thinking && <ThinkingBubble />}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-border-soft bg-white px-4 py-4 sm:px-6">
            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 rounded-[var(--radius-xl2)] border border-border-soft bg-surface/60 p-2 transition-colors focus-within:border-ai/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-ai/10"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Describe your symptoms or ask a health question..."
                aria-label="Message the AI health assistant"
                className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-navy placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ai text-white transition-all hover:bg-[#6d2fd6] disabled:opacity-40 disabled:hover:bg-ai"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              AI provides general information, not a medical diagnosis. In an
              emergency, call your local emergency number.
            </p>
          </div>
        </div>

        {/* ---------------- Capabilities sidebar ---------------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-[var(--radius-card)] border border-ai/15 bg-gradient-to-br from-ai/5 to-transparent p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Sparkles className="h-4.5 w-4.5 text-ai" />
                What I can help with
              </h2>
              <ul className="mt-4 space-y-3">
                {AI_CAPABILITIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <li key={c.title} className="flex gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ai shadow-[var(--shadow-soft)]">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy">
                          {c.title}
                        </p>
                        <p className="text-xs leading-5 text-ink-muted">
                          {c.desc}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>
      </Container>
    </section>
  );
}

/* ---------------- message bubble ---------------- */

function MessageBubble({
  message,
  onSuggestion,
}: {
  message: ChatMessage;
  onSuggestion: (text: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white",
          isUser
            ? "bg-primary"
            : "bg-gradient-to-br from-ai to-ai-light"
        )}
      >
        {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
      </span>

      <div className={cn("min-w-0 max-w-[78%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-7",
            isUser
              ? "rounded-tr-sm bg-primary text-white"
              : "rounded-tl-sm border border-border-soft bg-surface/70 text-navy"
          )}
        >
          {message.content}
        </div>

        {message.suggestions && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion(s)}
                className="rounded-full border border-ai/25 bg-ai/5 px-3.5 py-1.5 text-sm font-medium text-ai transition-colors hover:bg-ai/10 animate-fade-in"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {message.recommendations && (
          <div className="mt-3.5 space-y-4 w-full sm:w-[480px] animate-fade-in">
            {message.recommendations.doctorSlugs?.map((slug) => {
              const doc = getDoctor(slug);
              return doc ? <DoctorCard key={slug} doctor={doc} /> : null;
            })}
            {message.recommendations.clinicSlugs?.map((slug) => {
              const clinic = getClinic(slug);
              return clinic ? <ClinicCard key={slug} facility={clinic} /> : null;
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ai to-ai-light text-white">
        <Bot className="h-4.5 w-4.5" />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border-soft bg-surface/70 px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-ai/60"
          />
        ))}
      </div>
    </div>
  );
}
