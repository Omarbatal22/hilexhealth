"use client";

import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Google "G" glyph — lucide has no brand icons. */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [showPw, setShowPw] = React.useState(false);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-ink-soft">
        {isSignup
          ? "Start your journey to better, smarter healthcare."
          : "Log in to manage your appointments and health."}
      </p>

      {/* Social */}
      <div className="mt-7 grid gap-3">
        <Button variant="outline" size="lg" className="w-full justify-center">
          <GoogleGlyph className="h-5 w-5" />
          Continue with Google
        </Button>
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border-soft" />
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          or
        </span>
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      {/* Form (no backend — prevent default + go to dashboard) */}
      <form
        className="space-y-4"
        onSubmit={(e) => e.preventDefault()}
        action="/dashboard"
      >
        {isSignup && (
          <Field label="Full name" htmlFor="name">
            <Input id="name" icon={User} placeholder="Alex Morgan" autoComplete="name" />
          </Field>
        )}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          aside={
            !isSignup ? (
              <Link
                href="#"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            ) : undefined
          }
        >
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              icon={Lock}
              placeholder={isSignup ? "Create a password" : "Enter your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-primary"
            >
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </Field>

        {isSignup && (
          <label className="flex items-start gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border-soft text-primary focus:ring-primary"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="font-medium text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          asChild
        >
          <Link href="/dashboard">
            {isSignup ? "Create account" : "Log in"}
          </Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-primary hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  aside,
  children,
}: {
  label: string;
  htmlFor: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}
