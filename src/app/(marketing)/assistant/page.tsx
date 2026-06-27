import type { Metadata } from "next";
import { AssistantChat } from "@/components/sections/assistant/assistant-chat";

export const metadata: Metadata = {
  title: "AI Health Assistant | HelixHealth",
  description:
    "Chat with your HelixHealth AI assistant for symptom insights, lab explanations, and visit prep. General health information, not a diagnosis.",
};

export default function AssistantPage() {
  return <AssistantChat />;
}
