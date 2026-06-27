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
  Users,
  CalendarDays,
  MessageSquare,
  ClipboardList,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { getDoctor } from "@/lib/doctors";



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
  facilityId?: string;
  branchId?: string;
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
    facilityId: "helix-medical-center",
    branchId: "helix-nasr-city",
  },
  {
    doctorSlug: "david-kim",
    doctorName: "Dr. David Kim",
    specialty: "Internal Medicine",
    date: "Jul 3, 2026",
    time: "10:30 AM",
    mode: "Video visit",
    status: "Confirmed",
    facilityId: "nile-care-clinic",
    branchId: "nile-dokki",
  },
  {
    doctorSlug: "aisha-patel",
    doctorName: "Dr. Aisha Patel",
    specialty: "Dermatology",
    date: "Jul 9, 2026",
    time: "5:45 PM",
    mode: "Video visit",
    status: "Pending",
    facilityId: "nile-care-clinic",
    branchId: "nile-dokki",
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
    facilityId: "nile-care-clinic",
    branchId: "nile-dokki",
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

/* ===================================================================== */
/* ============================ PROVIDER ============================== */
/* ===================================================================== */
// Doctor-facing portal data. Mock-only, mirrors the patient-side shape.

/** The signed-in clinician (reuse a real doctor record). */
const _provider = getDoctor("sarah-johnson")!;
export const PROVIDER = {
  slug: _provider.slug,
  name: _provider.name,            // "Dr. Sarah Johnson"
  specialty: _provider.specialty,  // "Cardiology"
  title: _provider.title,
  location: _provider.location,
  rating: _provider.rating,
  reviewCount: _provider.reviewCount,
};

/* ---------------- Provider navigation ---------------- */
export const PROVIDER_NAV: AppNavItem[] = [
  { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/provider/patients", icon: Users },
  { label: "Schedule", href: "/provider/schedule", icon: CalendarDays },
  { label: "Messages", href: "/provider/messages", icon: MessageSquare },
  { label: "Settings", href: "/provider/settings", icon: Settings },
];

/* ---------------- Patient roster ---------------- */
export type PatientStatus = "Active" | "Needs review" | "Stable" | "New";

export interface RosterVital {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  tile: string; // tailwind bg-* class, same idea as HEALTH_STATS.tile
}

export interface RosterPatient {
  id: string;            // slug used in the URL
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  primaryCondition: string;
  status: PatientStatus;
  lastVisit: string;     // "Jun 12, 2026"
  nextVisit: string;     // "Jul 3, 2026" or "—"
  mode: "In-person" | "Video visit";
  phone: string;
  email: string;
  notes: string;
  vitals: RosterVital[];
  medications: Medication[];   // reuse existing Medication type
  records: RecordEntry[];      // reuse existing RecordEntry type
}

export const PATIENT_ROSTER: RosterPatient[] = [
  {
    id: "alex-morgan",
    name: "Alex Morgan",
    age: 41,
    gender: "Male",
    primaryCondition: "Hyperlipidemia",
    status: "Active",
    lastVisit: "Jun 12, 2026",
    nextVisit: "Jul 3, 2026",
    mode: "In-person",
    phone: "+1 (555) 012-3456",
    email: "alex.morgan@example.com",
    notes: "Patient is responding well to Atorvastatin. Has requested details on dietary adjustments. Exercise routine remains steady at 3-4 days/week.",
    vitals: [
      { label: "Heart Rate", value: "72", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
      { label: "Blood Pressure", value: "118/76", unit: "mmHg", icon: Activity, tile: "bg-primary" },
      { label: "Glucose", value: "94", unit: "mg/dL", icon: Droplet, tile: "bg-teal" },
      { label: "Sleep", value: "7.4", unit: "hrs", icon: Moon, tile: "bg-ai" },
    ],
    medications: MEDICATIONS,
    records: RECORDS,
  },
  {
    id: "maria-garcia",
    name: "Maria Garcia",
    age: 58,
    gender: "Female",
    primaryCondition: "Hypertension",
    status: "Needs review",
    lastVisit: "Jun 20, 2026",
    nextVisit: "Jun 30, 2026",
    mode: "In-person",
    phone: "+1 (555) 019-8765",
    email: "maria.garcia@example.com",
    notes: "Slight elevation in morning BP readings. Adjusting dosage or adding secondary agent may be required if readings remain above 140/90. Review BP log on next visit.",
    vitals: [
      { label: "Heart Rate", value: "81", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
      { label: "Blood Pressure", value: "142/90", unit: "mmHg", icon: Activity, tile: "bg-primary" },
    ],
    medications: [
      { name: "Lisinopril", dose: "10 mg", schedule: "Once daily · morning", refillIn: "4 days", taken: true },
      { name: "Amlodipine", dose: "5 mg", schedule: "Once daily · evening", refillIn: "20 days", taken: true },
    ],
    records: [
      { date: "Jun 20, 2026", title: "Hypertension Follow-up", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "BP elevated. Encouraged low-sodium diet and daily tracking." },
      { date: "Apr 15, 2026", title: "Basic Metabolic Panel", doctor: "HelixHealth Lab", type: "Lab", summary: "Electrolytes and kidney function normal." },
    ],
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    age: 34,
    gender: "Male",
    primaryCondition: "Asthma",
    status: "Stable",
    lastVisit: "May 28, 2026",
    nextVisit: "Aug 14, 2026",
    mode: "Video visit",
    phone: "+1 (555) 014-9821",
    email: "james.okafor@example.com",
    notes: "Asthma is well controlled with current maintenance inhaler. Rescue inhaler usage is infrequent (less than once per week). Spoke about seasonal allergy triggers.",
    vitals: [
      { label: "SPO2", value: "98", unit: "%", icon: Activity, tile: "bg-teal" },
      { label: "Heart Rate", value: "68", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
    ],
    medications: [
      { name: "Fluticasone", dose: "110 mcg", schedule: "2 puffs twice daily", refillIn: "18 days", taken: true },
      { name: "Albuterol", dose: "90 mcg", schedule: "As needed for shortness of breath", refillIn: "45 days", taken: false },
    ],
    records: [
      { date: "May 28, 2026", title: "Asthma Routine Check", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "Excellent control. PFTs stable. No exacerbations." },
    ],
  },
  {
    id: "linda-tran",
    name: "Linda Tran",
    age: 67,
    gender: "Female",
    primaryCondition: "Type 2 Diabetes",
    status: "Needs review",
    lastVisit: "Jun 22, 2026",
    nextVisit: "Jun 29, 2026",
    mode: "In-person",
    phone: "+1 (555) 017-4321",
    email: "linda.tran@example.com",
    notes: "Patient reports recent lightheadedness in late afternoons. Need to review glucose log and adjust Metformin or insulin doses accordingly.",
    vitals: [
      { label: "Glucose", value: "148", unit: "mg/dL", icon: Droplet, tile: "bg-teal" },
      { label: "Heart Rate", value: "76", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
    ],
    medications: [
      { name: "Metformin", dose: "1000 mg", schedule: "Twice daily · with meals", refillIn: "8 days", taken: true },
      { name: "Glipizide", dose: "5 mg", schedule: "Once daily · before breakfast", refillIn: "14 days", taken: true },
    ],
    records: [
      { date: "Jun 22, 2026", title: "Diabetic Management", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "A1c is 7.2%. Experiencing mild fluctuations. Monitoring closely." },
      { date: "Jun 20, 2026", title: "Hemoglobin A1c Test", doctor: "HelixHealth Lab", type: "Lab", summary: "HbA1c: 7.2% (slightly elevated)." },
    ],
  },
  {
    id: "noah-bennett",
    name: "Noah Bennett",
    age: 29,
    gender: "Male",
    primaryCondition: "Anxiety",
    status: "Active",
    lastVisit: "Jun 18, 2026",
    nextVisit: "Jul 9, 2026",
    mode: "Video visit",
    phone: "+1 (555) 011-2233",
    email: "noah.bennett@example.com",
    notes: "Began Sertraline 4 weeks ago. Reports improvement in baseline anxiety symptoms and sleep. Recommended continued cognitive behavioral therapy.",
    vitals: [
      { label: "Heart Rate", value: "70", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
      { label: "Sleep", value: "6.8", unit: "hrs", icon: Moon, tile: "bg-ai" },
    ],
    medications: [
      { name: "Sertraline", dose: "50 mg", schedule: "Once daily · morning", refillIn: "25 days", taken: true },
    ],
    records: [
      { date: "Jun 18, 2026", title: "Mental Health Evaluation", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "Response to Sertraline is positive. No major side effects reported." },
    ],
  },
  {
    id: "sofia-rossi",
    name: "Sofia Rossi",
    age: 45,
    gender: "Female",
    primaryCondition: "Migraine",
    status: "Stable",
    lastVisit: "Apr 30, 2026",
    nextVisit: "—",
    mode: "Video visit",
    phone: "+1 (555) 018-7766",
    email: "sofia.rossi@example.com",
    notes: "Migraine frequency reduced from 4 per month to less than 1 after starting Sumatriptan as needed. Patient is satisfied with management plan.",
    vitals: [
      { label: "Heart Rate", value: "74", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
    ],
    medications: [
      { name: "Sumatriptan", dose: "50 mg", schedule: "As needed at onset of headache", refillIn: "30 days", taken: false },
    ],
    records: [
      { date: "Apr 30, 2026", title: "Neurological Follow-up", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "Migraines well managed. Discussed trigger avoidance." },
    ],
  },
  {
    id: "daniel-cohen",
    name: "Daniel Cohen",
    age: 52,
    gender: "Male",
    primaryCondition: "Atrial Fibrillation",
    status: "Active",
    lastVisit: "Jun 24, 2026",
    nextVisit: "Jul 1, 2026",
    mode: "In-person",
    phone: "+1 (555) 013-5544",
    email: "daniel.cohen@example.com",
    notes: "Regular rate control established. Warfarin therapy is monitored with stable INR readings. Complains of mild fatigue. ECG performed today showed controlled A-fib rate.",
    vitals: [
      { label: "Heart Rate", value: "85", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
      { label: "Blood Pressure", value: "124/80", unit: "mmHg", icon: Activity, tile: "bg-primary" },
    ],
    medications: [
      { name: "Metoprolol Succinate", dose: "50 mg", schedule: "Once daily · morning", refillIn: "10 days", taken: true },
      { name: "Warfarin", dose: "5 mg", schedule: "Once daily · evening", refillIn: "15 days", taken: true },
    ],
    records: [
      { date: "Jun 24, 2026", title: "Arrhythmia Follow-up", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "Rate controlled. Fatigue noted, likely medication-related. Continuing same plan." },
      { date: "Jun 24, 2026", title: "Electrocardiogram (ECG)", doctor: "Dr. Sarah Johnson", type: "Imaging", summary: "Atrial fibrillation with controlled ventricular response." },
    ],
  },
  {
    id: "emma-wilson",
    name: "Emma Wilson",
    age: 23,
    gender: "Female",
    primaryCondition: "Annual Checkup",
    status: "New",
    lastVisit: "Jun 25, 2026",
    nextVisit: "Jul 11, 2026",
    mode: "In-person",
    phone: "+1 (555) 015-6677",
    email: "emma.wilson@example.com",
    notes: "Initial consultation completed. Healthy 23yo female presenting for preventive checkup. Blood panels ordered. Next visit scheduled to review lab values.",
    vitals: [
      { label: "Heart Rate", value: "65", unit: "bpm", icon: HeartPulse, tile: "bg-coral" },
      { label: "Blood Pressure", value: "110/70", unit: "mmHg", icon: Activity, tile: "bg-primary" },
    ],
    medications: [],
    records: [
      { date: "Jun 25, 2026", title: "Initial Wellness Intake", doctor: "Dr. Sarah Johnson", type: "Visit", summary: "Comprehensive assessment. Patient is in excellent physical health." },
    ],
  },
];

export function getRosterPatient(id: string): RosterPatient | undefined {
  return PATIENT_ROSTER.find((p) => p.id === id);
}

/* ---------------- Schedule ---------------- */
export interface ScheduleVisit {
  patientId: string;
  patientName: string;
  time: string;     // "9:00 AM"
  date: string;     // "Jun 27, 2026"
  reason: string;   // "Follow-up · BP check"
  mode: "In-person" | "Video visit";
  status: "Confirmed" | "Pending" | "Checked in" | "Completed";
}

export const TODAY_VISITS: ScheduleVisit[] = [
  {
    patientId: "james-okafor",
    patientName: "James Okafor",
    time: "9:00 AM",
    date: "Jun 27, 2026",
    reason: "Asthma Follow-up",
    mode: "Video visit",
    status: "Checked in",
  },
  {
    patientId: "maria-garcia",
    patientName: "Maria Garcia",
    time: "10:30 AM",
    date: "Jun 27, 2026",
    reason: "Hypertension Check",
    mode: "In-person",
    status: "Checked in",
  },
  {
    patientId: "daniel-cohen",
    patientName: "Daniel Cohen",
    time: "1:15 PM",
    date: "Jun 27, 2026",
    reason: "A-fib Follow-up",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    patientId: "sofia-rossi",
    patientName: "Sofia Rossi",
    time: "3:00 PM",
    date: "Jun 27, 2026",
    reason: "Migraine Consultation",
    mode: "Video visit",
    status: "Confirmed",
  },
  {
    patientId: "emma-wilson",
    patientName: "Emma Wilson",
    time: "4:30 PM",
    date: "Jun 27, 2026",
    reason: "Annual Checkup",
    mode: "In-person",
    status: "Confirmed",
  },
];

export const UPCOMING_VISITS: ScheduleVisit[] = [
  {
    patientId: "maria-garcia",
    patientName: "Maria Garcia",
    time: "11:00 AM",
    date: "Jun 30, 2026",
    reason: "Hypertension Follow-up",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    patientId: "daniel-cohen",
    patientName: "Daniel Cohen",
    time: "9:30 AM",
    date: "Jul 1, 2026",
    reason: "Arrhythmia Monitoring",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    patientId: "alex-morgan",
    patientName: "Alex Morgan",
    time: "10:30 AM",
    date: "Jul 3, 2026",
    reason: "Lipid Review",
    mode: "In-person",
    status: "Confirmed",
  },
  {
    patientId: "noah-bennett",
    patientName: "Noah Bennett",
    time: "2:15 PM",
    date: "Jul 9, 2026",
    reason: "Anxiety Follow-up",
    mode: "Video visit",
    status: "Pending",
  },
  {
    patientId: "emma-wilson",
    patientName: "Emma Wilson",
    time: "3:30 PM",
    date: "Jul 11, 2026",
    reason: "Lab Review",
    mode: "In-person",
    status: "Confirmed",
  },
];

export const PAST_VISITS: ScheduleVisit[] = [
  {
    patientId: "alex-morgan",
    patientName: "Alex Morgan",
    time: "9:00 AM",
    date: "Jun 12, 2026",
    reason: "Annual Physical",
    mode: "In-person",
    status: "Completed",
  },
  {
    patientId: "james-okafor",
    patientName: "James Okafor",
    time: "2:00 PM",
    date: "May 28, 2026",
    reason: "Asthma Check",
    mode: "Video visit",
    status: "Completed",
  },
  {
    patientId: "maria-garcia",
    patientName: "Maria Garcia",
    time: "10:30 AM",
    date: "May 20, 2026",
    reason: "BP Log Review",
    mode: "In-person",
    status: "Completed",
  },
  {
    patientId: "noah-bennett",
    patientName: "Noah Bennett",
    time: "4:00 PM",
    date: "May 18, 2026",
    reason: "Initial Mental Health",
    mode: "Video visit",
    status: "Completed",
  },
  {
    patientId: "sofia-rossi",
    patientName: "Sofia Rossi",
    time: "11:30 AM",
    date: "Apr 30, 2026",
    reason: "Migraine Protocol",
    mode: "Video visit",
    status: "Completed",
  },
];

/* ---------------- Messages ---------------- */
export interface Message {
  from: "patient" | "provider";
  body: string;
  time: string; // "10:24 AM"
}

export interface MessageThread {
  patientId: string;
  patientName: string;
  preview: string;     // last message snippet
  time: string;        // "10:24 AM" / "Yesterday"
  unread: number;
  messages: Message[]; // full conversation, 3–6 bubbles
}

export const PROVIDER_MESSAGES: MessageThread[] = [
  {
    patientId: "maria-garcia",
    patientName: "Maria Garcia",
    preview: "Dr. Johnson, my blood pressure reading this morning was 142/90...",
    time: "9:15 AM",
    unread: 1,
    messages: [
      { from: "patient", body: "Dr. Johnson, my blood pressure reading this morning was 142/90. Should I increase my dose?", time: "9:15 AM" }
    ]
  },
  {
    patientId: "linda-tran",
    patientName: "Linda Tran",
    preview: "Hello doctor, I'm experiencing some dizziness after starting...",
    time: "Yesterday",
    unread: 1,
    messages: [
      { from: "patient", body: "Hello doctor, I'm experiencing some dizziness after starting the new Metformin dose.", time: "Yesterday" }
    ]
  },
  {
    patientId: "alex-morgan",
    patientName: "Alex Morgan",
    preview: "I had a question about my latest lipid panel though...",
    time: "Yesterday",
    unread: 1,
    messages: [
      { from: "provider", body: "Hi Alex, just checking in to see how you are doing with the new cholesterol medication.", time: "2 days ago" },
      { from: "patient", body: "Hi Dr. Johnson, I've been taking it every night. No side effects so far!", time: "2 days ago" },
      { from: "patient", body: "I had a question about my latest lipid panel though, could you check it?", time: "Yesterday" }
    ]
  },
  {
    patientId: "daniel-cohen",
    patientName: "Daniel Cohen",
    preview: "Yes, please choose a slot through the scheduling tab.",
    time: "3 days ago",
    unread: 0,
    messages: [
      { from: "patient", body: "Can we schedule a follow-up for next week?", time: "3 days ago" },
      { from: "provider", body: "Yes, please choose a slot through the scheduling tab.", time: "3 days ago" }
    ]
  },
  {
    patientId: "noah-bennett",
    patientName: "Noah Bennett",
    preview: "Glad to hear that. We will review it at our next visit.",
    time: "4 days ago",
    unread: 0,
    messages: [
      { from: "patient", body: "The anxiety medication seems to be helping, thank you.", time: "4 days ago" },
      { from: "provider", body: "Glad to hear that. We will review it at our next visit.", time: "4 days ago" }
    ]
  }
];

/* ---------------- Tasks ---------------- */
export interface ProviderTask {
  label: string;
  patientName: string;
  due: string;       // "Today" / "Tomorrow"
  done: boolean;
  icon: LucideIcon;  // e.g. FileText, ClipboardList, Pill
}

export const PROVIDER_TASKS: ProviderTask[] = [
  { label: "Review blood pressure log", patientName: "Maria Garcia", due: "Today", done: false, icon: ClipboardList },
  { label: "Sign refill request for Atorvastatin", patientName: "Alex Morgan", due: "Today", done: false, icon: Pill },
  { label: "Call patient regarding lab results", patientName: "Linda Tran", due: "Today", done: false, icon: Phone },
  { label: "Authorize imaging referral", patientName: "Daniel Cohen", due: "Tomorrow", done: false, icon: FileText },
  { label: "Approve consultation notes", patientName: "Sofia Rossi", due: "Yesterday", done: true, icon: FileText },
  { label: "Review annual checkup questionnaire", patientName: "Emma Wilson", due: "Yesterday", done: true, icon: ClipboardList },
];

/* ---------------- Dashboard stat tiles ---------------- */
export const PROVIDER_STATS = [
  { label: "Active patients", value: "8",  unit: "",     icon: Users,        tile: "bg-primary" },
  { label: "Today's visits",  value: "5",  unit: "",     icon: CalendarDays, tile: "bg-teal" },
  { label: "Unread messages", value: "3",  unit: "",     icon: MessageSquare,tile: "bg-ai" },
  { label: "Pending tasks",   value: "4",  unit: "",     icon: ClipboardList,tile: "bg-coral" },
] as const;

