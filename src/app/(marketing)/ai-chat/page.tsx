import type { Metadata } from "next";
import { AssistantChat } from "@/components/sections/assistant/assistant-chat";

export const metadata: Metadata = {
  title: "AI Chat | HelixHealth",
  description:
    "Start a conversation with Helix AI — symptom insights, lab explanations, and visit prep. General health information, not a diagnosis.",
};

/**
 * AI Chat entry point reached from the Hero prompt bar and suggestion chips.
 * An optional `?q=` search param is pre-filled and auto-sent as the first turn.
 */
export default async function AiChatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const initialPrompt = Array.isArray(q) ? q[0] : q;

  return <AssistantChat initialPrompt={initialPrompt} />;
}
