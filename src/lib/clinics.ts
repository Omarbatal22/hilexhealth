import { Car, Pill, FlaskConical, Accessibility, Wifi, Coffee, Baby, type LucideIcon } from "lucide-react";
import { type Review, getDoctor } from "@/lib/doctors";

export type FacilityType =
  | "clinic"
  | "medical_center"
  | "hospital"
  | "diagnostic_center"
  | "laboratory"
  | "radiology_center"
  | "dental_center"
  | "eye_center"
  | "physiotherapy_clinic";

export interface Service {
  id: string;
  label: string;
}

export interface Amenity {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface Insurance {
  id: string;
  label: string;
}

export type DayHours = { open: string; close: string } | "closed";
export type WeeklyHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  DayHours
>;

export interface Branch {
  id: string;
  slug: string; // /clinics/[clinicSlug]/branches/[slug]
  facilityId: string;
  name: string; // "Maadi Branch"
  address: { governorate: string; city: string; area: string; street: string };
  geo: { lat: number; lng: number };
  phone: string;
  workingHours: WeeklyHours;
  parking: boolean;
  wheelchair: boolean;
  doctorIds: string[]; // doctor slugs that practice here
}

export interface MedicalFacility {
  id: string;
  slug: string; // /clinics/[slug]
  name: string;
  type: FacilityType;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  specialtySlugs: string[]; // FK → SPECIALTIES.slug
  serviceIds: string[]; // FK → SERVICES
  amenityIds: string[]; // FK → AMENITIES
  insuranceIds: string[]; // FK → INSURANCERS
  branchIds: string[]; // FK → BRANCHES
  featured: boolean;
  aiScore: number; // 0..100 ranking hook for "AI Recommended"
  reviews: Review[];
}

export interface DoctorBranchSchedule {
  doctorId: string; // doctor slug
  branchId: string;
  feeUsd: number;
  slots: string[]; // subset of TIME_SLOTS
}

/* ---------------- Seed Lookups ---------------- */

export const SERVICES: Service[] = [
  { id: "consultation", label: "General Consultation" },
  { id: "lab-tests", label: "Laboratory Tests" },
  { id: "x-ray", label: "X-Ray Imaging" },
  { id: "ultrasound", label: "Ultrasound Scan" },
  { id: "ecg", label: "Electrocardiogram (ECG)" },
  { id: "physiotherapy", label: "Physiotherapy Session" },
  { id: "vaccination", label: "Vaccination & Immunization" },
  { id: "minor-surgery", label: "Minor Surgical Procedures" },
];

export const AMENITIES: Amenity[] = [
  { id: "parking", label: "Free Parking", icon: Car },
  { id: "pharmacy", label: "On-site Pharmacy", icon: Pill },
  { id: "lab", label: "Diagnostic Lab", icon: FlaskConical },
  { id: "wheelchair", label: "Wheelchair Accessible", icon: Accessibility },
  { id: "wifi", label: "Free Wi-Fi", icon: Wifi },
  { id: "cafe", label: "Cafeteria", icon: Coffee },
  { id: "kids-area", label: "Kids Play Area", icon: Baby },
];

export const INSURANCERS: Insurance[] = [
  { id: "axa", label: "AXA Insurance" },
  { id: "allianz", label: "Allianz" },
  { id: "metlife", label: "MetLife" },
  { id: "bupa", label: "Bupa" },
  { id: "misr-insurance", label: "Misr Insurance" },
  { id: "self-pay", label: "Self-Pay / Cash" },
];

const DEFAULT_HOURS: WeeklyHours = {
  mon: { open: "09:00 AM", close: "09:00 PM" },
  tue: { open: "09:00 AM", close: "09:00 PM" },
  wed: { open: "09:00 AM", close: "09:00 PM" },
  thu: { open: "09:00 AM", close: "09:00 PM" },
  fri: "closed",
  sat: { open: "10:00 AM", close: "04:00 PM" },
  sun: { open: "09:00 AM", close: "09:00 PM" },
};

/* ---------------- Seed Branches (8 total) ---------------- */

export const BRANCHES: Branch[] = [
  {
    id: "helix-nasr-city",
    slug: "nasr-city",
    facilityId: "helix-medical-center",
    name: "Nasr City Branch",
    address: { governorate: "Cairo", city: "Cairo", area: "Nasr City", street: "14 Abbas El Akkad St." },
    geo: { lat: 30.0596, lng: 31.3414 },
    phone: "+20 2 2401 2345",
    workingHours: DEFAULT_HOURS,
    parking: true,
    wheelchair: true,
    doctorIds: ["sarah-johnson", "michael-chen"],
  },
  {
    id: "helix-new-cairo",
    slug: "new-cairo",
    facilityId: "helix-medical-center",
    name: "New Cairo Branch",
    address: { governorate: "Cairo", city: "New Cairo", area: "New Cairo", street: "90th Street, Sector 1" },
    geo: { lat: 30.0168, lng: 31.4828 },
    phone: "+20 2 2810 5678",
    workingHours: DEFAULT_HOURS,
    parking: true,
    wheelchair: true,
    doctorIds: ["emily-rodriguez", "james-wilson"],
  },
  {
    id: "nile-dokki",
    slug: "dokki",
    facilityId: "nile-care-clinic",
    name: "Dokki Branch",
    address: { governorate: "Giza", city: "Giza", area: "Dokki", street: "45 Tahrir St." },
    geo: { lat: 30.0383, lng: 31.2122 },
    phone: "+20 2 3760 1122",
    workingHours: DEFAULT_HOURS,
    parking: false,
    wheelchair: true,
    doctorIds: ["aisha-patel", "david-kim"],
  },
  {
    id: "nile-6october",
    slug: "6th-of-october",
    facilityId: "nile-care-clinic",
    name: "6th of October Branch",
    address: { governorate: "Giza", city: "6th of October", area: "6th of October", street: "El Mehwar El Markazi" },
    geo: { lat: 29.9722, lng: 30.9478 },
    phone: "+20 2 3835 4433",
    workingHours: DEFAULT_HOURS,
    parking: true,
    wheelchair: true,
    doctorIds: ["james-wilson", "david-kim"],
  },
  {
    id: "alex-heart-branch",
    slug: "main-branch",
    facilityId: "alexandria-heart-inst",
    name: "Alexandria Branch",
    address: { governorate: "Alexandria", city: "Alexandria", area: "Sidi Gaber", street: "Horreya Ave" },
    geo: { lat: 31.2242, lng: 29.9442 },
    phone: "+20 3 5467 890",
    workingHours: DEFAULT_HOURS,
    parking: true,
    wheelchair: true,
    doctorIds: ["sarah-johnson", "aisha-patel"],
  },
  {
    id: "cairo-ortho-maadi",
    slug: "maadi",
    facilityId: "cairo-ortho-clinic",
    name: "Maadi Branch",
    address: { governorate: "Cairo", city: "Cairo", area: "Maadi", street: "Road 9, Maadi" },
    geo: { lat: 29.9602, lng: 31.2569 },
    phone: "+20 2 2358 9900",
    workingHours: DEFAULT_HOURS,
    parking: false,
    wheelchair: false,
    doctorIds: ["michael-chen"],
  },
  {
    id: "smile-dokki",
    slug: "dokki",
    facilityId: "smile-dental-center",
    name: "Dokki Branch",
    address: { governorate: "Giza", city: "Giza", area: "Dokki", street: "12 Mossadak St." },
    geo: { lat: 30.0401, lng: 31.2098 },
    phone: "+20 2 3336 4455",
    workingHours: DEFAULT_HOURS,
    parking: true,
    wheelchair: true,
    doctorIds: ["emily-rodriguez"],
  },
  {
    id: "smile-heliopolis",
    slug: "heliopolis",
    facilityId: "smile-dental-center",
    name: "Heliopolis Branch",
    address: { governorate: "Cairo", city: "Cairo", area: "Heliopolis", street: "El Merghany St." },
    geo: { lat: 30.0883, lng: 31.3303 },
    phone: "+20 2 2417 8899",
    workingHours: DEFAULT_HOURS,
    parking: true,
    wheelchair: true,
    doctorIds: ["sarah-johnson", "david-kim"],
  },
];

/* ---------------- Seed Facilities (5 total) ---------------- */

export const CLINICS: MedicalFacility[] = [
  {
    id: "helix-medical-center",
    slug: "helix-medical-center",
    name: "HelixHealth Medical Center",
    type: "medical_center",
    tagline: "Comprehensive family medicine & specialist care",
    description: "HelixHealth Medical Center brings together top specialists and diagnostic labs under one roof to deliver standard care in Cairo.",
    rating: 4.9,
    reviewCount: 142,
    specialtySlugs: ["general", "cardiology", "pediatrics", "neurology"],
    serviceIds: ["consultation", "lab-tests", "ultrasound", "ecg"],
    amenityIds: ["parking", "pharmacy", "lab", "wheelchair", "wifi"],
    insuranceIds: ["axa", "allianz", "metlife", "bupa", "self-pay"],
    branchIds: ["helix-nasr-city", "helix-new-cairo"],
    featured: true,
    aiScore: 95,
    reviews: [
      { author: "Tarek M.", rating: 5, date: "3 days ago", body: "Extremely professional staff and pristine clean facilities." },
      { author: "Hana A.", rating: 4, date: "2 weeks ago", body: "Good experience, doctor was very thorough and attentive." }
    ],
  },
  {
    id: "nile-care-clinic",
    slug: "nile-care-clinic",
    name: "Nile Care Clinic",
    type: "clinic",
    tagline: "Patient-centered healthcare for your family",
    description: "Nile Care Clinic is dedicated to providing high-quality primary and preventive medical services at our branches in Giza.",
    rating: 4.7,
    reviewCount: 98,
    specialtySlugs: ["general", "pediatrics", "internal"],
    serviceIds: ["consultation", "vaccination", "ultrasound"],
    amenityIds: ["pharmacy", "wheelchair", "wifi"],
    insuranceIds: ["axa", "metlife", "misr-insurance", "self-pay"],
    branchIds: ["nile-dokki", "nile-6october"],
    featured: true,
    aiScore: 88,
    reviews: [
      { author: "Sherif G.", rating: 5, date: "1 week ago", body: "Quick check-in and friendly pediatric doctors." },
      { author: "Layla F.", rating: 4, date: "1 month ago", body: "Very convenient location. The Dokki branch is highly recommended." }
    ],
  },
  {
    id: "alexandria-heart-inst",
    slug: "alexandria-heart-institute",
    name: "Alexandria Heart Institute",
    type: "medical_center",
    tagline: "Specialized cardiac care on the Mediterranean coast",
    description: "Alexandria Heart Institute is a leading regional facility focusing on advanced cardiovascular treatments and diagnostics.",
    rating: 4.8,
    reviewCount: 76,
    specialtySlugs: ["cardiology", "internal"],
    serviceIds: ["consultation", "ecg", "ultrasound", "minor-surgery"],
    amenityIds: ["parking", "lab", "wheelchair"],
    insuranceIds: ["axa", "allianz", "bupa", "self-pay"],
    branchIds: ["alex-heart-branch"],
    featured: false,
    aiScore: 90,
    reviews: [
      { author: "Ahmed K.", rating: 5, date: "5 days ago", body: "World-class cardiology consultation. Feeling much better." }
    ],
  },
  {
    id: "cairo-ortho-clinic",
    slug: "cairo-orthopedic-clinic",
    name: "Cairo Orthopedic Clinic",
    type: "clinic",
    tagline: "Regain your mobility and lead an active life",
    description: "Cairo Orthopedic Clinic specializes in bone, joint, and muscle therapies, helping patients recover from sports injuries and arthritis.",
    rating: 4.5,
    reviewCount: 54,
    specialtySlugs: ["orthopedics"],
    serviceIds: ["consultation", "x-ray", "physiotherapy"],
    amenityIds: ["wifi", "cafe"],
    insuranceIds: ["metlife", "allianz", "self-pay"],
    branchIds: ["cairo-ortho-maadi"],
    featured: false,
    aiScore: 84,
    reviews: [
      { author: "Youssef N.", rating: 4, date: "3 weeks ago", body: "The physiotherapy sessions are excellent here." }
    ],
  },
  {
    id: "smile-dental-center",
    slug: "smile-dental-center",
    name: "Smile Dental Center",
    type: "dental_center",
    tagline: "Beautiful smiles begin with healthy teeth",
    description: "Smile Dental Center provides comprehensive general, cosmetic, and implant dentistry services across Giza and Cairo.",
    rating: 4.6,
    reviewCount: 112,
    specialtySlugs: ["general"],
    serviceIds: ["consultation", "minor-surgery", "x-ray"],
    amenityIds: ["parking", "wheelchair", "kids-area", "wifi"],
    insuranceIds: ["axa", "metlife", "allianz", "self-pay"],
    branchIds: ["smile-dokki", "smile-heliopolis"],
    featured: true,
    aiScore: 80,
    reviews: [
      { author: "Mariam E.", rating: 5, date: "2 days ago", body: "No pain during the procedure, clean clinic, highly recommended." }
    ],
  },
];

/* ---------------- Seed Schedules ---------------- */

export const DOCTOR_BRANCH_SCHEDULES: DoctorBranchSchedule[] = [
  {
    doctorId: "sarah-johnson",
    branchId: "helix-nasr-city",
    feeUsd: 180,
    slots: ["9:00 AM", "10:30 AM", "4:30 PM"],
  },
  {
    doctorId: "sarah-johnson",
    branchId: "alex-heart-branch",
    feeUsd: 200,
    slots: ["9:30 AM", "11:00 AM", "5:45 PM"],
  },
  {
    doctorId: "sarah-johnson",
    branchId: "smile-heliopolis",
    feeUsd: 180,
    slots: ["2:15 PM", "3:00 PM"],
  },
  {
    doctorId: "michael-chen",
    branchId: "helix-nasr-city",
    feeUsd: 150,
    slots: ["9:00 AM", "9:30 AM", "3:00 PM"],
  },
  {
    doctorId: "michael-chen",
    branchId: "cairo-ortho-maadi",
    feeUsd: 160,
    slots: ["11:00 AM", "2:15 PM", "4:30 PM"],
  },
  {
    doctorId: "emily-rodriguez",
    branchId: "helix-new-cairo",
    feeUsd: 170,
    slots: ["10:30 AM", "3:00 PM", "5:45 PM"],
  },
  {
    doctorId: "emily-rodriguez",
    branchId: "smile-dokki",
    feeUsd: 170,
    slots: ["9:00 AM", "11:00 AM", "2:15 PM"],
  },
  {
    doctorId: "james-wilson",
    branchId: "helix-new-cairo",
    feeUsd: 140,
    slots: ["9:30 AM", "2:15 PM", "4:30 PM"],
  },
  {
    doctorId: "james-wilson",
    branchId: "nile-6october",
    feeUsd: 130,
    slots: ["10:30 AM", "3:00 PM"],
  },
  {
    doctorId: "aisha-patel",
    branchId: "nile-dokki",
    feeUsd: 165,
    slots: ["9:00 AM", "11:00 AM", "4:30 PM"],
  },
  {
    doctorId: "aisha-patel",
    branchId: "alex-heart-branch",
    feeUsd: 180,
    slots: ["10:30 AM", "2:15 PM", "5:45 PM"],
  },
  {
    doctorId: "david-kim",
    branchId: "nile-dokki",
    feeUsd: 155,
    slots: ["9:30 AM", "3:00 PM", "5:45 PM"],
  },
  {
    doctorId: "david-kim",
    branchId: "nile-6october",
    feeUsd: 155,
    slots: ["9:00 AM", "2:15 PM"],
  },
  {
    doctorId: "david-kim",
    branchId: "smile-heliopolis",
    feeUsd: 155,
    slots: ["11:00 AM", "4:30 PM"],
  },
];

/* ---------------- Selector Functions ---------------- */

export function getClinic(slug: string): MedicalFacility | undefined {
  return CLINICS.find((c) => c.slug === slug);
}

export function getBranch(clinicSlug: string, branchSlug: string): Branch | undefined {
  const facility = getClinic(clinicSlug);
  if (!facility) return undefined;
  return BRANCHES.find((b) => b.facilityId === facility.id && b.slug === branchSlug);
}

export function getBranchesForClinic(facilityId: string): Branch[] {
  return BRANCHES.filter((b) => b.facilityId === facilityId);
}

export function getClinicsForDoctor(doctorSlug: string): MedicalFacility[] {
  const docBranches = BRANCHES.filter((b) => b.doctorIds.includes(doctorSlug));
  const facilityIds = new Set(docBranches.map((b) => b.facilityId));
  return CLINICS.filter((c) => facilityIds.has(c.id));
}

export function getDoctorsForBranch(branchId: string) {
  const branch = BRANCHES.find((b) => b.id === branchId);
  if (!branch) return [];
  return branch.doctorIds.map((slug) => getDoctor(slug)).filter(Boolean);
}

export function getScheduleForDoctorAtBranch(
  doctorSlug: string,
  branchId: string
): DoctorBranchSchedule | undefined {
  return DOCTOR_BRANCH_SCHEDULES.find((s) => s.doctorId === doctorSlug && s.branchId === branchId);
}

export function isOpenNow(branch: Branch, now: Date = new Date("2026-06-29T10:00:00")): boolean {
  const days: Array<keyof WeeklyHours> = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayName = days[now.getDay()];
  const hours = branch.workingHours[dayName];
  if (hours === "closed") return false;

  const parseTimeToMinutes = (timeStr: string) => {
    const cleanStr = timeStr.trim().toLowerCase();
    const match = cleanStr.match(/^(\d+):(\d+)\s*(am|pm)?$/);
    if (!match) return 0;
    let hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm === "pm" && hrs < 12) hrs += 12;
    if (ampm === "am" && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(hours.open);
  const closeMinutes = parseTimeToMinutes(hours.close);

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export function recommendClinics(opts: {
  specialtySlug?: string;
  governorate?: string;
  limit?: number;
}): MedicalFacility[] {
  let list = CLINICS;
  if (opts.specialtySlug) {
    list = list.filter((c) => c.specialtySlugs.includes(opts.specialtySlug!));
  }
  if (opts.governorate) {
    list = list.filter((c) => {
      const branches = getBranchesForClinic(c.id);
      return branches.some((b) => b.address.governorate.toLowerCase() === opts.governorate!.toLowerCase());
    });
  }
  list = [...list].sort((a, b) => b.aiScore - a.aiScore);
  if (opts.limit) {
    list = list.slice(0, opts.limit);
  }
  return list;
}

export function getRelatedClinics(facility: MedicalFacility, limit?: number): MedicalFacility[] {
  let list = CLINICS.filter((c) => c.id !== facility.id);
  list = list.filter(
    (c) => c.type === facility.type || c.specialtySlugs.some((s) => facility.specialtySlugs.includes(s))
  );
  list = [...list].sort((a, b) => b.rating - a.rating);
  if (limit) {
    list = list.slice(0, limit);
  }
  return list;
}
