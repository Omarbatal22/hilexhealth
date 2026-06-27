import type { Metadata } from "next";
import { AppPage, PageHeading } from "@/components/app/page-heading";
import { ProviderSettingsForm } from "@/components/sections/provider/provider-settings-form";

export const metadata: Metadata = {
  title: "Settings | HelixHealth",
  description: "Manage your provider profile, availability, and notification preferences.",
};

export default function SettingsPage() {
  return (
    <AppPage>
      <PageHeading
        title="Settings"
        subtitle="Manage your profile, availability, and notification preferences."
      />
      <div className="mt-8">
        <ProviderSettingsForm />
      </div>
    </AppPage>
  );
}
