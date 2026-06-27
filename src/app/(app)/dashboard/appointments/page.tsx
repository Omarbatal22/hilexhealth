import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { AppointmentsList } from "@/components/sections/dashboard/appointments-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Appointments | HelixHealth",
  description: "Manage your upcoming and past appointments.",
};

export default function AppointmentsPage() {
  return (
    <AppPage>
      <PageHeading
        title="Appointments"
        subtitle="Manage your visits, join video calls, and rebook with ease."
        action={
          <Button variant="primary" size="md" asChild>
            <Link href="/doctors">
              <Plus className="h-4 w-4" /> Book appointment
            </Link>
          </Button>
        }
      />
      <div className="mt-8">
        <AppointmentsList />
      </div>
    </AppPage>
  );
}
