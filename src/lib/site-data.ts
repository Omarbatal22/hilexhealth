import {
  Activity,
  BadgeCheck,
  Bot,
  CalendarCheck,
  ClipboardList,
  FolderLock,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserSearch,
  Users,
  Heart,
  Calendar,
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
