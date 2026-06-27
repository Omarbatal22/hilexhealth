"use client";

import { Send, User } from "lucide-react";
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PROVIDER_MESSAGES } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export function MessagesPanel() {
  const [threads, setThreads] = React.useState(() =>
    PROVIDER_MESSAGES.map((t) => ({ ...t, messages: [...t.messages] }))
  );
  const [selectedId, setSelectedId] = React.useState<string>(
    PROVIDER_MESSAGES[0]?.patientId || ""
  );
  const [composeText, setComposeText] = React.useState("");

  const activeThread = threads.find(
    (t) => t.patientId === selectedId
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] min-h-[600px] items-stretch">
      {/* Left Pane - Thread List */}
      <Card className="flex flex-col h-[600px]">
        <div className="p-4 border-b border-border-soft">
          <h3 className="font-display font-bold text-navy text-base">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border-soft">
          {PROVIDER_MESSAGES.map((thread) => {
            const active = thread.patientId === selectedId;
            return (
              <button
                key={thread.patientId}
                type="button"
                onClick={() => setSelectedId(thread.patientId)}
                className={cn(
                  "w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-soft-bg",
                  active && "bg-primary-bg/70 hover:bg-primary-bg"
                )}
              >
                <Avatar name={thread.patientName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm font-semibold text-navy", thread.unread > 0 && "font-bold")}>
                      {thread.patientName}
                    </p>
                    <span className="text-[11px] text-ink-muted whitespace-nowrap shrink-0">
                      {thread.time}
                    </span>
                  </div>
                  <p className={cn("text-xs text-ink-soft truncate mt-0.5", thread.unread > 0 && "font-medium text-navy")}>
                    {thread.preview}
                  </p>
                </div>
                {thread.unread > 0 && (
                  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Right Pane - Chat Window */}
      <Card className="flex flex-col h-[600px] overflow-hidden">
        {activeThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border-soft bg-surface/40 flex items-center gap-3">
              <Avatar name={activeThread.patientName} size="sm" />
              <div>
                <p className="text-sm font-bold text-navy leading-none">
                  {activeThread.patientName}
                </p>
                <span className="text-xs text-ink-muted">Patient Chart Reference: {activeThread.patientId}</span>
              </div>
            </div>

            {/* Chat Bubbles */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-soft-bg/30">
              {activeThread.messages.map((msg, idx) => {
                const isProvider = msg.from === "provider";
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col max-w-[75%]",
                      isProvider ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-6",
                        isProvider
                          ? "bg-primary text-white rounded-tr-none shadow-sm"
                          : "bg-white text-navy border border-border-soft rounded-tl-none shadow-[var(--shadow-soft)]"
                      )}
                    >
                      {msg.body}
                    </div>
                    <span className="text-[10px] text-ink-muted mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-border-soft bg-white">
              <form
                className="flex items-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (composeText.trim() && activeThread) {
                    setThreads((prev) =>
                      prev.map((t) =>
                        t.patientId === activeThread.patientId
                          ? {
                              ...t,
                              messages: [
                                ...t.messages,
                                { from: "provider" as const, body: composeText, time: "Just now" },
                              ],
                              preview: composeText,
                              time: "Just now",
                            }
                          : t
                      )
                    );
                    setComposeText("");
                  }
                }}
              >
                <textarea
                  rows={1}
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="Type a clinical response message..."
                  className="flex-1 h-11 min-h-[44px] max-h-24 rounded-xl border border-border-soft bg-white px-4 py-2.5 text-sm text-navy placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <Button type="submit" variant="primary" size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-ink-soft">
            <User className="h-10 w-10 text-ink-muted mb-3" />
            <p className="font-display text-lg font-bold text-navy">No thread selected</p>
            <p className="mt-2 text-sm text-ink-soft">
              Select a patient message thread from the sidebar to view clinical chat.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
