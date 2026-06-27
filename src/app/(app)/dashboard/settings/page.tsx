import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { SettingsForm } from "@/components/sections/dashboard/settings-form";

export const metadata: Metadata = {
  title: "Settings | HelixHealth",
  description: "Manage your profile, notifications, privacy, and security.",
};

export default function SettingsPage() {
  return (
    <AppPage>
      <PageHeading
        title="Settings"
        subtitle="Manage your profile, notifications, and privacy preferences."
      />
      <div className="mt-8">
        <SettingsForm />
      </div>
    </AppPage>
  );
}
