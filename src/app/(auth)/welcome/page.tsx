import type { Metadata } from "next";
import { WelcomeFlow } from "./welcome-flow";

export const metadata: Metadata = {
  title: "Welcome | HelixHealth",
  description: "Personalize your HelixHealth patient experience.",
};

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f6f3ff] via-soft-bg to-white flex items-center justify-center p-6">
      {/* soft AI aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ai/15 blur-3xl animate-blob-morph"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-blob-morph [animation-delay:-4s]"
      />

      <WelcomeFlow />
    </div>
  );
}
