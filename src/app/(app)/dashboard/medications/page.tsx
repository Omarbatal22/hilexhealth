import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { MedicationsList } from "@/components/sections/dashboard/medications-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Medications | HelixHealth",
  description: "Track your medications, mark doses, and request refills.",
};

export default function MedicationsPage() {
  return (
    <AppPage>
      <PageHeading
        title="Medications"
        subtitle="Track doses, refills, and reminders in one place."
        action={
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" /> Add medication
          </Button>
        }
      />
      <div className="mt-8">
        <MedicationsList />
      </div>
    </AppPage>
  );
}
