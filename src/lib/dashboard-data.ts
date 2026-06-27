import {
  Bot,
  CalendarPlus,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MessageSquareHeart,
  Pill,
  Search,
  Settings,
  Stethoscope,
  Activity,
  Droplet,
  Footprints,
  Moon,
  type LucideIcon,
} from "lucide-react";

/* ---------------- App (authenticated) navigation ---------------- */
export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const APP_NAV: AppNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find Doctors", href: "/doctors", icon: Search },
  { label: "AI Assistant", href: "/assistant", icon: Bot },
  { label: "Appointments", href: "/dashboard/appointments", icon: CalendarPlus },
  { label: "Records", href: "/dashboard/records", icon: FileText },
  { label: "Medications", href: "/dashboard/medications", icon: Pill },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const PATIENT = {
  name: "Alex Morgan",
  memberSince: "2023",
  plan: "HelixHealth Premium",
};

/* ---------------- Upcoming appointments ---------------- */
export interface Appointment {
  doctorSlug: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  mode: "In-person" | "Video visit";
  status: "Confirmed" | "Pending";
}

export const UPCOMING_APPOINTMENTS: Appointment[] = [
  {
    doctorSlug: "sarah-johnson",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "Jun 30, 2026",
    time: "4:30 PM",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    doctorSlug: "david-kim",
    doctorName: "Dr. David Kim",
    specialty: "Internal Medicine",
    date: "Jul 3, 2026",
    time: "10:30 AM",
    mode: "Video visit",
    status: "Confirmed",
  },
  {
    doctorSlug: "aisha-patel",
    doctorName: "Dr. Aisha Patel",
    specialty: "Dermatology",
    date: "Jul 9, 2026",
    time: "5:45 PM",
    mode: "Video visit",
    status: "Pending",
  },
];

export const PAST_APPOINTMENTS: Appointment[] = [
  {
    doctorSlug: "david-kim",
    doctorName: "Dr. David Kim",
    specialty: "Internal Medicine",
    date: "Jun 12, 2026",
    time: "9:00 AM",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    doctorSlug: "sarah-johnson",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "Apr 28, 2026",
    time: "2:15 PM",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    doctorSlug: "michael-chen",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurology",
    date: "Mar 03, 2026",
    time: "11:30 AM",
    mode: "Video visit",
    status: "Confirmed",
  },
];

/* ---------------- Health metrics ---------------- */
export interface HealthStat {
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  tile: string;
}

export const HEALTH_STATS: HealthStat[] = [
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    trend: "Normal",
    trendUp: true,
    icon: HeartPulse,
    tile: "bg-coral",
  },
  {
    label: "Blood Pressure",
    value: "118/76",
    unit: "mmHg",
    trend: "Healthy",
    trendUp: true,
    icon: Activity,
    tile: "bg-primary",
  },
  {
    label: "Glucose",
    value: "94",
    unit: "mg/dL",
    trend: "Stable",
    trendUp: true,
    icon: Droplet,
    tile: "bg-teal",
  },
  {
    label: "Sleep",
    value: "7.4",
    unit: "hrs",
    trend: "+0.5 this wk",
    trendUp: true,
    icon: Moon,
    tile: "bg-ai",
  },
];

/* ---------------- Activity rings / weekly goals ---------------- */
export interface Goal {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: LucideIcon;
  color: string;
}

export const WEEKLY_GOALS: Goal[] = [
  { label: "Steps", current: 8240, target: 10000, unit: "steps", icon: Footprints, color: "text-primary" },
  { label: "Active", current: 38, target: 45, unit: "min", icon: Activity, color: "text-teal" },
  { label: "Water", current: 6, target: 8, unit: "glasses", icon: Droplet, color: "text-[#0ea5b7]" },
];

/* ---------------- Medications ---------------- */
export interface Medication {
  name: string;
  dose: string;
  schedule: string;
  refillIn: string;
  taken: boolean;
}

export const MEDICATIONS: Medication[] = [
  { name: "Atorvastatin", dose: "20 mg", schedule: "Once daily · evening", refillIn: "12 days", taken: true },
  { name: "Metformin", dose: "500 mg", schedule: "Twice daily · with meals", refillIn: "5 days", taken: false },
  { name: "Vitamin D3", dose: "2000 IU", schedule: "Once daily · morning", refillIn: "21 days", taken: true },
];

/* ---------------- Quick actions ---------------- */
export interface QuickAction {
  label: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  tone: "primary" | "ai" | "teal" | "warning";
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Book Appointment", desc: "Find & book a doctor", href: "/doctors", icon: Stethoscope, tone: "primary" },
  { label: "Ask AI Assistant", desc: "Get instant health insights", href: "/assistant", icon: MessageSquareHeart, tone: "ai" },
  { label: "View Records", desc: "Your medical history", href: "/dashboard/records", icon: FileText, tone: "teal" },
  { label: "Refill Medication", desc: "Request a prescription", href: "/dashboard/medications", icon: Pill, tone: "warning" },
];

/* ---------------- Medical records timeline ---------------- */
export interface RecordEntry {
  date: string;
  title: string;
  doctor: string;
  type: "Visit" | "Lab" | "Imaging" | "Prescription" | "Vaccine";
  summary: string;
}

export const RECORDS: RecordEntry[] = [
  {
    date: "Jun 12, 2026",
    title: "Annual Physical Examination",
    doctor: "Dr. David Kim",
    type: "Visit",
    summary: "Overall health excellent. Recommended continued exercise and follow-up lipid panel in 6 months.",
  },
  {
    date: "Jun 12, 2026",
    title: "Comprehensive Metabolic Panel",
    doctor: "HelixHealth Lab",
    type: "Lab",
    summary: "All values within normal range. Glucose 94 mg/dL, cholesterol slightly elevated.",
  },
  {
    date: "Apr 28, 2026",
    title: "Cardiology Consultation",
    doctor: "Dr. Sarah Johnson",
    type: "Visit",
    summary: "Echocardiogram normal. Continue current medication. Blood pressure well controlled.",
  },
  {
    date: "Mar 15, 2026",
    title: "Chest X-Ray",
    doctor: "Dr. Sarah Johnson",
    type: "Imaging",
    summary: "Clear lung fields. No abnormalities detected.",
  },
  {
    date: "Feb 02, 2026",
    title: "Influenza Vaccine",
    doctor: "HelixHealth Clinic",
    type: "Vaccine",
    summary: "Seasonal flu vaccination administered. No adverse reactions.",
  },
];
