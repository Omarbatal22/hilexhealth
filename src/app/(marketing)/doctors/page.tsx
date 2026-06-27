import type { Metadata } from "next";
import { DoctorSearch } from "@/components/sections/doctors/doctor-search";

export const metadata: Metadata = {
  title: "Find Doctors | HelixHealth",
  description:
    "Search verified specialists by name, specialty, or condition. Filter by availability, video visits, and patient rating.",
};

export default function DoctorsPage() {
  return <DoctorSearch />;
}
