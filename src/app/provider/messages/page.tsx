import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { MessagesPanel } from "@/components/sections/provider/messages-panel";

export const metadata: Metadata = {
  title: "Messages | HelixHealth",
  description: "Secure HIPAA-compliant clinician message inbox.",
};

export default function MessagesPage() {
  return (
    <AppPage>
      <PageHeading
        title="Messages"
        subtitle="HIPAA-compliant secure messaging with patients and care team members."
      />
      <div className="mt-8">
        <MessagesPanel />
      </div>
    </AppPage>
  );
}
