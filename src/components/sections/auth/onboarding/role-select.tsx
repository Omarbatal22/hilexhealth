import * as React from "react";
import { Stethoscope, User } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleSelectProps {
  onSelect: (role: "patient" | "doctor") => void;
  selectedRole?: "patient" | "doctor";
}

export function RoleSelect({ onSelect, selectedRole }: RoleSelectProps) {
  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
          Create your account
        </h1>
        <p className="mt-2 text-ink-soft">
          Choose how you will use HelixHealth to get started.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Patient Option */}
        <Card
          onClick={() => onSelect("patient")}
          className={cn(
            "group relative cursor-pointer border border-border-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-large)]",
            selectedRole === "patient"
              ? "border-primary bg-primary-soft/5 ring-1 ring-primary"
              : "bg-surface hover:border-primary/30"
          )}
        >
          <CardBody className="p-6 flex flex-col h-full justify-between">
            <div>
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105",
                  selectedRole === "patient" && "bg-primary text-white"
                )}
              >
                <User className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-navy">
                I am a Patient
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Find medical clinics, book specialist visits, and get smart healthcare guidance from Helix AI.
              </p>
            </div>
            <Button
              variant={selectedRole === "patient" ? "primary" : "outline"}
              size="sm"
              className="mt-6 w-full justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onSelect("patient");
              }}
            >
              Continue as Patient
            </Button>
          </CardBody>
        </Card>

        {/* Doctor Option */}
        <Card
          onClick={() => onSelect("doctor")}
          className={cn(
            "group relative cursor-pointer border border-border-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-large)]",
            selectedRole === "doctor"
              ? "border-primary bg-primary-soft/5 ring-1 ring-primary"
              : "bg-surface hover:border-primary/30"
          )}
        >
          <CardBody className="p-6 flex flex-col h-full justify-between">
            <div>
              <span
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105",
                  selectedRole === "doctor" && "bg-primary text-white"
                )}
              >
                <Stethoscope className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-navy">
                I am a Provider
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Manage your appointments calendar, review patient records, view health files, and manage your clinics.
              </p>
            </div>
            <Button
              variant={selectedRole === "doctor" ? "primary" : "outline"}
              size="sm"
              className="mt-6 w-full justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onSelect("doctor");
              }}
            >
              Continue as Provider
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
