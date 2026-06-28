import { Quote, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * Split-panel auth shell: brand/marketing on the left (hidden on mobile),
 * the form card on the right. Shared by login + signup.
 */
export function AuthShell({
  children,
  size = "default",
}: {
  children: React.ReactNode;
  size?: "default" | "wide";
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-navy via-navy-light to-primary p-12 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 animate-blob-morph rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 animate-blob-morph rounded-full bg-primary-light/20 blur-3xl [animation-delay:-5s]"
        />

        <Link href="/" className="relative">
          <Logo invert />
        </Link>

        <div className="relative mt-auto max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Healthcare that
            <br />
            understands you.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Join millions who find the right doctor, get instant AI insights,
            and manage their care in one place.
          </p>

          <div className="mt-8 rounded-[var(--radius-card)] bg-white/10 p-5 backdrop-blur-sm">
            <Quote className="h-6 w-6 text-primary-light" />
            <p className="mt-2 text-[15px] leading-7 text-white/90">
              &ldquo;Booking a specialist used to take days. Now it&apos;s
              minutes — and the AI assistant actually helped me prepare.&rdquo;
            </p>
            <p className="mt-3 text-sm font-semibold">Jordan M. · Patient since 2024</p>
          </div>
        </div>

        <div className="relative mt-8 flex items-center gap-6 text-sm text-white/60">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-success" /> HIPAA Compliant
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-ai-light" /> AI-Powered
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col bg-soft-bg">
        <div className="p-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className={cn("w-full transition-all duration-300", size === "wide" ? "max-w-2xl" : "max-w-md")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
