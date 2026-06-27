import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { PatientRoster } from "@/components/sections/provider/patient-roster";

export const metadata: Metadata = {
  title: "Patients | HelixHealth",
  description: "Search, filter, and manage your patient panel roster.",
};

export default function PatientsPage() {
  return (
    <AppPage>
      <PageHeading
        title="Patients"
        subtitle="Search, filter, and view records across your active clinical roster."
      />
      <div className="mt-8">
        <PatientRoster />
      </div>
    </AppPage>
  );
}
