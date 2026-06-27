import {
  Activity,
  CalendarPlus,
  HeartPulse,
  Moon,
  Pill,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** assistant follow-up suggestion chips */
  suggestions?: string[];
  recommendations?: { doctorSlugs?: string[]; clinicSlugs?: string[] };
}

/** Seed conversation shown when the assistant first loads. */
export const SEED_CONVERSATION: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Hi Alex 👋 I'm your HelixHealth AI health assistant. I can help you understand symptoms, prepare for appointments, and make sense of your health data. What's on your mind today?\n\nNote: I provide general health information, not a medical diagnosis.",
    suggestions: [
      "I have a headache and feel tired",
      "Explain my latest lab results",
      "What should I ask my cardiologist?",
    ],
  },
];

/**
 * Canned, keyword-matched replies — there is no backend, so the assistant
 * simulates intelligence by matching a few intents and falling back to a
 * generic-but-helpful response.
 */
export interface CannedReply {
  match: RegExp;
  reply: string;
  suggestions?: string[];
  recommendations?: { doctorSlugs?: string[]; clinicSlugs?: string[] };
}

export const CANNED_REPLIES: CannedReply[] = [
  {
    match: /headache|tired|fatigue|migraine/i,
    reply:
      "Headaches paired with fatigue are common and often tied to dehydration, stress, poor sleep, or screen strain. A few things that can help right now:\n\n• Drink a glass of water and rest your eyes for 15 minutes\n• Check whether you've eaten recently — low blood sugar is a frequent trigger\n• Note if there's any tension in your neck or shoulders\n\n⚠️ Seek prompt care if the headache is sudden and severe, follows a head injury, or comes with vision changes, confusion, or a stiff neck. Would you like me to find a neurologist near you?",
    suggestions: ["Find a neurologist", "How much water should I drink?", "Track this symptom"],
    recommendations: { doctorSlugs: ["michael-chen"], clinicSlugs: ["helix-medical-center"] },
  },
  {
    match: /lab|result|cholesterol|glucose|blood test/i,
    reply:
      "Here's a plain-language summary of your most recent panel (Jun 12, 2026):\n\n• Glucose — 94 mg/dL — normal range (70–99)\n• Blood pressure — 118/76 — healthy\n• Total cholesterol — slightly elevated; your doctor noted a follow-up lipid panel in 6 months\n\nOverall this is a strong set of results. The one thing to keep an eye on is cholesterol — diet and regular activity usually move it in the right direction. Want some practical, heart-healthy diet tips?",
    suggestions: ["Heart-healthy diet tips", "Why is cholesterol high?", "Book a follow-up"],
  },
  {
    match: /cardiologist|heart|appointment|ask my doctor|prepare/i,
    reply:
      "Great question — going in prepared makes a big difference. For your cardiology visit, consider asking:\n\n1. What do my blood pressure and cholesterol numbers mean for my long-term risk?\n2. Are my current medications still the right fit?\n3. What lifestyle changes would have the biggest impact for me specifically?\n4. How often should I be monitoring at home?\n\nI can add these to a note you bring to your Jun 30 appointment with Dr. Johnson. Want me to do that?",
    suggestions: ["Save these questions", "What is good blood pressure?", "Reschedule appointment"],
    recommendations: { doctorSlugs: ["sarah-johnson"], clinicSlugs: ["alexandria-heart-institute"] },
  },
  {
    match: /diet|nutrition|eat|food|weight/i,
    reply:
      "For heart and metabolic health, the evidence consistently favors a few simple patterns:\n\n• Fill half your plate with vegetables and fruit\n• Choose whole grains over refined ones\n• Prefer fish, legumes, and lean protein; limit processed and red meat\n• Use olive oil; cut back on added sugar and salt\n\nYou don't need a perfect diet — small, consistent swaps add up. Would you like a sample one-day meal plan?",
    suggestions: ["Sample meal plan", "Snacks to avoid", "Find a nutritionist"],
  },
  {
    match: /sleep|insomnia|rest/i,
    reply:
      "Your sleep is averaging 7.4 hrs this week — that's within the healthy range and up 0.5 hrs from last week. Nice trend. To protect it:\n\n• Keep a consistent wake time, even on weekends\n• Dim screens an hour before bed\n• Keep the room cool and dark\n\nIs there something specific making it hard to fall or stay asleep?",
    suggestions: ["Trouble falling asleep", "Is 7 hours enough?", "Track my sleep"],
  },
];

export const FALLBACK_REPLY: CannedReply = {
  match: /.*/,
  reply:
    "Thanks for sharing that. While I can't give a medical diagnosis, I can help you think it through, summarize your health data, or connect you with the right specialist. Could you tell me a bit more — when it started, how it feels, and whether anything makes it better or worse?",
  suggestions: ["Find a doctor", "Check my symptoms", "Talk to a human"],
};

export function getReply(input: string): CannedReply {
  return CANNED_REPLIES.find((r) => r.match.test(input)) ?? FALLBACK_REPLY;
}

/* Capability cards shown in the empty-state / sidebar. */
export interface Capability {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const AI_CAPABILITIES: Capability[] = [
  { icon: Stethoscope, title: "Symptom insights", desc: "Understand what your symptoms might mean" },
  { icon: Activity, title: "Explain results", desc: "Plain-language summaries of your labs" },
  { icon: CalendarPlus, title: "Visit prep", desc: "Know what to ask your doctor" },
  { icon: Pill, title: "Medication help", desc: "Reminders, interactions, and refills" },
  { icon: HeartPulse, title: "Health tracking", desc: "Spot trends in your vitals" },
  { icon: Moon, title: "Lifestyle coaching", desc: "Sleep, diet, and activity guidance" },
];
