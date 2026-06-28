import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/sections/auth/onboarding/onboarding-flow";
import { AuthShell } from "@/components/sections/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create your account | HelixHealth",
  description: "Create your HelixHealth account — smarter, AI-powered healthcare in one place.",
};

export default function SignupPage() {
  return (
    <AuthShell size="wide">
      <OnboardingFlow />
    </AuthShell>
  );
}
