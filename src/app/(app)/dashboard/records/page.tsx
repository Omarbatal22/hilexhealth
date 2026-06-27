import { Download } from "lucide-react";
import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { RecordsTimeline } from "@/components/sections/dashboard/records-timeline";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Medical Records | HelixHealth",
  description: "Your complete medical history — visits, labs, imaging, and vaccinations.",
};

export default function RecordsPage() {
  return (
    <AppPage>
      <PageHeading
        title="Medical Records"
        subtitle="Your complete health history in one secure timeline."
        action={
          <Button variant="primary" size="md" className="hidden sm:inline-flex">
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="mt-8">
        <RecordsTimeline />
      </div>
    </AppPage>
  );
}
