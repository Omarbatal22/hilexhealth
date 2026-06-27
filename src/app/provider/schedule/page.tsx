import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { ScheduleBoard } from "@/components/sections/provider/schedule-board";

export const metadata: Metadata = {
  title: "Schedule | HelixHealth",
  description: "View and manage your upcoming and completed clinician appointments.",
};

export default function SchedulePage() {
  return (
    <AppPage>
      <PageHeading
        title="Schedule"
        subtitle="Manage patient appointments, video visits, and clinic sessions."
      />
      <div className="mt-8">
        <ScheduleBoard />
      </div>
    </AppPage>
  );
}
