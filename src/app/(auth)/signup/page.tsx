import type { Metadata } from "next";
import { AuthForm } from "@/components/sections/auth/auth-form";
import { AuthShell } from "@/components/sections/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign up | HelixHealth",
  description: "Create your HelixHealth account — smarter, AI-powered healthcare in one place.",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
