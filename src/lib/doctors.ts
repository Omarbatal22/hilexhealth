import {
  Brain,
  Bone,
  Baby,
  Eye,
  HeartPulse,
  Stethoscope,
  Activity,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface Specialty {
  slug: string;
  label: string;
  icon: LucideIcon;
}

export const SPECIALTIES: Specialty[] = [
  { slug: "cardiology", label: "Cardiology", icon: HeartPulse },
  { slug: "neurology", label: "Neurology", icon: Brain },
  { slug: "pediatrics", label: "Pediatrics", icon: Baby },
  { slug: "orthopedics", label: "Orthopedics", icon: Bone },
  { slug: "dermatology", label: "Dermatology", icon: Sparkles },
  { slug: "ophthalmology", label: "Ophthalmology", icon: Eye },
  { slug: "general", label: "General Practice", icon: Stethoscope },
  { slug: "internal", label: "Internal Medicine", icon: Activity },
];

export interface Review {
  author: string;
  rating: number;
  date: string;
  body: string;
}

export interface Doctor {
  slug: string;
  name: string;
  specialty: string; // matches Specialty.label
  specialtySlug: string;
  title: string;
  location: string;
  distanceMi: number;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  feeUsd: number;
  /** soonest availability label */
  nextAvailable: string;
  availableToday: boolean;
  videoVisit: boolean;
  bio: string;
  languages: string[];
  education: string[];
  focusAreas: string[];
  reviews: Review[];
  primaryClinicId?: string;
  clinicIds?: string[];
}

export const DOCTORS: Doctor[] = [
  {
    slug: "sarah-johnson",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    specialtySlug: "cardiology",
    title: "Cardiologist · Heart & Vascular Institute",
    location: "San Francisco, CA",
    distanceMi: 1.2,
    rating: 4.9,
    reviewCount: 412,
    experienceYears: 15,
    feeUsd: 180,
    nextAvailable: "Today, 4:30 PM",
    availableToday: true,
    videoVisit: true,
    bio: "Dr. Johnson is a board-certified cardiologist specializing in preventive cardiology and heart failure management. She believes in partnering with patients to build sustainable, heart-healthy lifestyles.",
    languages: ["English", "Spanish"],
    education: [
      "MD, Stanford University School of Medicine",
      "Residency, UCSF Medical Center",
      "Fellowship in Cardiology, Johns Hopkins",
    ],
    focusAreas: ["Preventive Cardiology", "Heart Failure", "Hypertension", "Echocardiography"],
    reviews: [
      {
        author: "Michael R.",
        rating: 5,
        date: "2 weeks ago",
        body: "Dr. Johnson took the time to explain everything clearly and never made me feel rushed. Genuinely caring.",
      },
      {
        author: "Priya S.",
        rating: 5,
        date: "1 month ago",
        body: "Thorough, knowledgeable, and warm. The follow-up plan she set up made a real difference.",
      },
      {
        author: "David L.",
        rating: 4,
        date: "2 months ago",
        body: "Great doctor, slightly long wait time but the care was worth it.",
      },
    ],
    primaryClinicId: "helix-medical-center",
    clinicIds: ["helix-medical-center", "alexandria-heart-institute", "smile-dental-center"],
  },
  {
    slug: "michael-chen",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    specialtySlug: "neurology",
    title: "Neurologist · NeuroCare Center",
    location: "San Francisco, CA",
    distanceMi: 2.8,
    rating: 4.8,
    reviewCount: 287,
    experienceYears: 12,
    feeUsd: 200,
    nextAvailable: "Tomorrow, 9:00 AM",
    availableToday: false,
    videoVisit: true,
    bio: "Dr. Chen focuses on headache disorders, epilepsy, and neurodegenerative conditions, combining the latest diagnostics with a patient-first approach.",
    languages: ["English", "Mandarin"],
    education: [
      "MD, Harvard Medical School",
      "Residency in Neurology, Massachusetts General Hospital",
    ],
    focusAreas: ["Migraine & Headache", "Epilepsy", "Movement Disorders", "EEG"],
    reviews: [
      {
        author: "Anna K.",
        rating: 5,
        date: "3 weeks ago",
        body: "Finally someone who took my migraines seriously. The treatment plan is working.",
      },
      {
        author: "Tom W.",
        rating: 5,
        date: "1 month ago",
        body: "Extremely knowledgeable and patient with all my questions.",
      },
    ],
    primaryClinicId: "helix-medical-center",
    clinicIds: ["helix-medical-center", "cairo-orthopedic-clinic"],
  },
  {
    slug: "emily-rodriguez",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    specialtySlug: "pediatrics",
    title: "Pediatrician · Sunshine Children's Clinic",
    location: "Oakland, CA",
    distanceMi: 4.1,
    rating: 5.0,
    reviewCount: 531,
    experienceYears: 10,
    feeUsd: 140,
    nextAvailable: "Today, 2:15 PM",
    availableToday: true,
    videoVisit: true,
    bio: "Dr. Rodriguez provides compassionate, family-centered pediatric care from newborns through adolescence, with a special interest in childhood nutrition and development.",
    languages: ["English", "Spanish"],
    education: [
      "MD, UCLA David Geffen School of Medicine",
      "Residency in Pediatrics, Children's Hospital Los Angeles",
    ],
    focusAreas: ["Newborn Care", "Childhood Nutrition", "Developmental Screening", "Vaccinations"],
    reviews: [
      {
        author: "Jessica M.",
        rating: 5,
        date: "1 week ago",
        body: "My kids actually look forward to their visits. She's amazing with children.",
      },
      {
        author: "Carlos D.",
        rating: 5,
        date: "3 weeks ago",
        body: "Patient, kind, and incredibly thorough. Highly recommend.",
      },
    ],
    primaryClinicId: "helix-medical-center",
    clinicIds: ["helix-medical-center", "smile-dental-center"],
  },
  {
    slug: "james-wilson",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    specialtySlug: "orthopedics",
    title: "Orthopedic Surgeon · Bay Area Sports Medicine",
    location: "San Jose, CA",
    distanceMi: 8.6,
    rating: 4.7,
    reviewCount: 198,
    experienceYears: 18,
    feeUsd: 220,
    nextAvailable: "Wed, 11:30 AM",
    availableToday: false,
    videoVisit: false,
    bio: "Dr. Wilson specializes in sports injuries and joint reconstruction, helping athletes and active patients return to the activities they love.",
    languages: ["English"],
    education: [
      "MD, Duke University School of Medicine",
      "Fellowship in Sports Medicine, Hospital for Special Surgery",
    ],
    focusAreas: ["Sports Injuries", "Knee & Shoulder", "Joint Replacement", "Arthroscopy"],
    reviews: [
      {
        author: "Ryan T.",
        rating: 5,
        date: "2 weeks ago",
        body: "Got me back on the field after my ACL tear. Excellent surgeon.",
      },
      {
        author: "Linda H.",
        rating: 4,
        date: "1 month ago",
        body: "Very skilled. Office could be a bit more responsive but the care was top-notch.",
      },
    ],
    primaryClinicId: "helix-medical-center",
    clinicIds: ["helix-medical-center", "nile-care-clinic"],
  },
  {
    slug: "aisha-patel",
    name: "Dr. Aisha Patel",
    specialty: "Dermatology",
    specialtySlug: "dermatology",
    title: "Dermatologist · Clear Skin Dermatology",
    location: "Berkeley, CA",
    distanceMi: 5.3,
    rating: 4.9,
    reviewCount: 364,
    experienceYears: 9,
    feeUsd: 160,
    nextAvailable: "Today, 5:45 PM",
    availableToday: true,
    videoVisit: true,
    bio: "Dr. Patel treats the full range of medical and cosmetic skin conditions, with particular expertise in acne, eczema, and skin cancer screening.",
    languages: ["English", "Hindi", "Gujarati"],
    education: [
      "MD, Yale School of Medicine",
      "Residency in Dermatology, NYU Langone",
    ],
    focusAreas: ["Acne & Eczema", "Skin Cancer Screening", "Cosmetic Dermatology", "Psoriasis"],
    reviews: [
      {
        author: "Sophie B.",
        rating: 5,
        date: "5 days ago",
        body: "Cleared up my skin after years of trying everything. So grateful.",
      },
      {
        author: "Mark P.",
        rating: 5,
        date: "3 weeks ago",
        body: "Caught a suspicious mole early. Thorough and reassuring.",
      },
    ],
    primaryClinicId: "nile-care-clinic",
    clinicIds: ["nile-care-clinic", "alexandria-heart-institute"],
  },
  {
    slug: "david-kim",
    name: "Dr. David Kim",
    specialty: "Internal Medicine",
    specialtySlug: "internal",
    title: "Internist · HelixHealth Primary Care",
    location: "San Francisco, CA",
    distanceMi: 0.8,
    rating: 4.8,
    reviewCount: 276,
    experienceYears: 14,
    feeUsd: 150,
    nextAvailable: "Tomorrow, 10:30 AM",
    availableToday: false,
    videoVisit: true,
    bio: "Dr. Kim provides comprehensive primary care for adults, emphasizing preventive medicine and chronic disease management with a holistic, long-term view of patient health.",
    languages: ["English", "Korean"],
    education: [
      "MD, Columbia University",
      "Residency in Internal Medicine, UCSF",
    ],
    focusAreas: ["Preventive Care", "Diabetes Management", "Annual Physicals", "Chronic Care"],
    reviews: [
      {
        author: "Grace L.",
        rating: 5,
        date: "1 week ago",
        body: "The kind of doctor who actually remembers your history. Feels like a true partner in my health.",
      },
      {
        author: "Omar F.",
        rating: 5,
        date: "1 month ago",
        body: "Helped me get my diabetes under control. Clear, practical guidance.",
      },
    ],
    primaryClinicId: "nile-care-clinic",
    clinicIds: ["nile-care-clinic", "smile-dental-center"],
  },
];

export function getDoctor(slug: string): Doctor | undefined {
  return DOCTORS.find((d) => d.slug === slug);
}

/** Time slots shown on the profile / booking pages. */
export const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:30 AM",
  "11:00 AM",
  "2:15 PM",
  "3:00 PM",
  "4:30 PM",
  "5:45 PM",
] as const;

export interface DaySlot {
  day: string;
  date: string;
  slots: number;
}

export const AVAILABILITY_DAYS: DaySlot[] = [
  { day: "Mon", date: "Jun 30", slots: 6 },
  { day: "Tue", date: "Jul 1", slots: 3 },
  { day: "Wed", date: "Jul 2", slots: 8 },
  { day: "Thu", date: "Jul 3", slots: 0 },
  { day: "Fri", date: "Jul 4", slots: 5 },
];
