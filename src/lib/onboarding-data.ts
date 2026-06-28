export const GENDERS = ["Female", "Male", "Prefer not to say"] as const;
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"] as const;
export const EXPERIENCE_RANGES = ["0–2 years", "3–5 years", "6–10 years", "11–15 years", "16+ years"] as const;

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: string[];
}

export const PATIENT_ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "q1",
    question: "What brings you to HelixHealth?",
    options: ["Managing symptoms", "General wellness check", "Seeking specialist advice", "Other"],
  },
  {
    id: "q2",
    question: "How often do you see a healthcare provider?",
    options: ["Only when sick", "Once a year", "Every few months", "Multiple times a month"],
  },
  {
    id: "q3",
    question: "Are there any chronic conditions you're actively managing?",
    options: ["Hypertension", "Diabetes", "Asthma/COPD", "None / Prefer not to say"],
  },
  {
    id: "q4",
    question: "How can Helix AI assist you the most?",
    options: ["Understanding symptoms", "Preparing for visits", "Explaining labs", "Medication help"],
  },
];

// Form data shape (single source for autosave + validation)
export interface OnboardingData {
  role?: "patient" | "doctor";
  // basic
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  // personal
  gender?: string;
  dob?: string;
  governorate?: string;
  city?: string;
  area?: string;
  // patient optional medical
  bloodType?: string;
  chronic?: string[];
  allergies?: string[];
  // preferences
  prefReminders?: boolean;
  prefAiRecs?: boolean;
  prefUpdates?: boolean;
  // doctor professional
  specialty?: string;
  subspecialty?: string;
  experience?: string;
  clinic?: string;
  // doctor verification (file names only — no real upload)
  licenseNumber?: string;
  syndicateNumber?: string;
  licenseFile?: string;
  idFile?: string;
  // doctor links + availability
  linkedin?: string;
  website?: string;
  onlineConsults?: boolean;
}

export const ONBOARDING_STORAGE_KEY = "helix:onboarding";
