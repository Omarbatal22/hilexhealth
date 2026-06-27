import {
  Activity,
  BadgeCheck,
  Bot,
  CalendarCheck,
  ClipboardList,
  FolderLock,
  Phone,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserSearch,
  Users,
  Heart,
  Calendar,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Find Doctors", href: "/doctors" },
  { label: "AI Assistant", href: "/assistant" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Health Tools", href: "#health-tools" },
  { label: "About Us", href: "#about" },
];

export interface TrustItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  { icon: Sparkles, title: "AI-Powered", desc: "Smart recommendations" },
  { icon: BadgeCheck, title: "Verified Doctors", desc: "Trusted & experienced" },
  { icon: CalendarCheck, title: "Instant Booking", desc: "Book in seconds" },
  { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is safe" },
];

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** tailwind token name for the icon tile accent */
  accent: "ai" | "teal" | "warning" | "primary";
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: Stethoscope,
    title: "AI Symptom Checker",
    desc: "Get AI-based insights instantly",
    accent: "ai",
  },
  {
    icon: UserSearch,
    title: "Find the Right Doctor",
    desc: "Personalized matches near you",
    accent: "teal",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    desc: "Book appointments in seconds",
    accent: "warning",
  },
  {
    icon: FolderLock,
    title: "Health Records",
    desc: "Securely store and access anytime",
    accent: "primary",
  },
];

export interface ServiceCard {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** gradient classes for the card background */
  gradient: string;
  /** icon tile gradient */
  iconGradient: string;
  iconColor: string;
  /** AI cards keep purple, others stay in brand range */
  ai?: boolean;
}

export const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Talk to your personal health AI assistant",
    gradient: "from-[#eef4ff] to-[#e0ecff]",
    iconGradient: "from-[#ede9fe] to-[#ddd6fe]",
    iconColor: "text-ai",
    ai: true,
  },
  {
    icon: Search,
    title: "Find Doctors",
    desc: "Search by specialty, location & ratings",
    gradient: "from-[#eafaff] to-[#dbf3fb]",
    iconGradient: "from-[#cffafe] to-[#a5f3fc]",
    iconColor: "text-[#0ea5b7]",
  },
  {
    icon: Calendar,
    title: "Book Instantly",
    desc: "Real-time availability and easy booking",
    gradient: "from-[#fff6e9] to-[#ffedd0]",
    iconGradient: "from-[#fed7aa] to-[#fdba74]",
    iconColor: "text-[#ea8a04]",
  },
  {
    icon: FolderLock,
    title: "Health Records",
    desc: "Access your medical history securely",
    gradient: "from-[#f0eeff] to-[#e6e2ff]",
    iconGradient: "from-[#ddd6fe] to-[#c4b5fd]",
    iconColor: "text-[#6d28d9]",
  },
  {
    icon: ClipboardList,
    title: "Symptoms Check",
    desc: "Check your symptoms and get AI advice",
    gradient: "from-[#fff0f3] to-[#ffe0e7]",
    iconGradient: "from-[#fecdd3] to-[#fda4af]",
    iconColor: "text-coral",
  },
];

export interface StatItem {
  icon: LucideIcon;
  value: string;
  label: string;
  /** background tile color */
  tile: string;
}

export const STATS: StatItem[] = [
  { icon: Users, value: "10M+", label: "Patients", tile: "bg-primary" },
  { icon: Stethoscope, value: "50K+", label: "Doctors", tile: "bg-teal" },
  { icon: Activity, value: "2M+", label: "Appointments", tile: "bg-ai" },
  { icon: Heart, value: "98%", label: "Satisfaction", tile: "bg-coral" },
];

/* ---------------- Hero AI prompt chips ---------------- */
export interface PromptChip {
  icon: LucideIcon;
  label: string;
  /** prompt pre-filled in the AI chat when the chip is clicked */
  prompt: string;
}

/**
 * Suggestion chips under the Hero AI prompt bar. Each navigates to the AI
 * chat with its `prompt` pre-filled as the first message. Prompts are worded
 * to match the assistant's canned intents in `assistant-data.ts`.
 */
export const HERO_PROMPT_CHIPS: PromptChip[] = [
  { icon: Stethoscope, label: "Analyze my symptoms", prompt: "I have a headache and feel tired" },
  { icon: UserSearch, label: "Find the right doctor", prompt: "Help me find the right doctor" },
  { icon: CalendarCheck, label: "Book an appointment", prompt: "I'd like to book an appointment" },
  { icon: Pill, label: "Explain my medication", prompt: "Explain my medication and how to take it" },
];

/** Rotating placeholder copy isn't needed — one inviting line keeps it calm. */
export const HERO_AI_PLACEHOLDER = "Ask Helix AI anything about your health...";

/* ---------------- Booking section (location filters) ---------------- */
export const GOVERNORATES: string[] = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Sharqia",
  "Qalyubia",
  "Port Said",
  "Suez",
];

export const DISTRICTS: string[] = [
  "Nasr City",
  "Maadi",
  "Heliopolis",
  "Zamalek",
  "Dokki",
  "Mohandessin",
  "New Cairo",
  "6th of October",
];

/* ---------------- Online consultation cards ---------------- */
export interface ConsultationCard {
  icon: LucideIcon;
  title: string;
  desc: string;
  cta: string;
  href: string;
  /** icon tile gradient */
  iconGradient: string;
  iconColor: string;
}

export const CONSULTATION_CARDS: ConsultationCard[] = [
  {
    icon: Phone,
    title: "Voice Consultation",
    desc: "Talk to a licensed doctor by phone — no travel, no waiting room.",
    cta: "Start voice call",
    href: "/doctors",
    iconGradient: "from-[#cffafe] to-[#a5f3fc]",
    iconColor: "text-[#0ea5b7]",
  },
  {
    icon: Video,
    title: "Video Consultation",
    desc: "Face-to-face video visits with specialists from anywhere.",
    cta: "Start video call",
    href: "/doctors",
    iconGradient: "from-[#ede9fe] to-[#ddd6fe]",
    iconColor: "text-ai",
  },
];

export const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Top Specialties",
    links: ["Cardiology", "Dermatology", "Pediatrics", "Neurology", "Orthopedics"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Press", "Contact Us"],
  },
  {
    title: "Support",
    links: ["Help Center", "FAQs", "Privacy Policy", "Terms of Service", "Accessibility"],
  },
];
