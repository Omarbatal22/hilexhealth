import type { Metadata } from "next";
import { AuthForm } from "@/components/sections/auth/auth-form";
import { AuthShell } from "@/components/sections/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log in | HelixHealth",
  description: "Log in to manage your appointments, records, and AI health assistant.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
