"use client";

import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { GoogleGlyph } from "@/components/brand/social-glyphs";

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
