import { ArrowLeft, MessageSquare, Calendar, Phone, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppPage } from "@/components/app/page-heading";
import { PatientDetail } from "@/components/sections/provider/patient-detail";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PATIENT_ROSTER, getRosterPatient } from "@/lib/dashboard-data";

export function generateStaticParams() {
  return PATIENT_ROSTER.map((p) => ({ slug: p.id }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const patient = getRosterPatient(slug);
  if (!patient) return { title: "Patient Not Found | HelixHealth" };
  return {
    title: `${patient.name} — Patient Chart | HelixHealth`,
    description: `Clinical history and records for ${patient.name}.`,
  };
}

const STATUS_TONES: Record<string, Parameters<typeof Badge>[0]["tone"]> = {
  Active: "primary",
  "Needs review": "warning",
  Stable: "success",
  New: "neutral",
};

export default async function PatientChartPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const patient = getRosterPatient(slug);

  if (!patient) {
    notFound();
  }

  return (
    <AppPage>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/provider/patients"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to patients roster
        </Link>

        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-primary to-primary-light" />
          <CardBody className="-mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar name={patient.name} size="xl" ring />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-navy">
                      {patient.name}
                    </h1>
                    <Badge tone={STATUS_TONES[patient.status] || "neutral"} size="sm">
                      {patient.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {patient.age} years old · {patient.gender} · {patient.primaryCondition}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/provider/messages">
                    <MessageSquare className="h-4 w-4" /> Message
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/provider/schedule">
                    <Calendar className="h-4 w-4" /> Schedule
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contact row */}
            <div className="mt-6 pt-4 border-t border-border-soft flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-ink-muted" />
                {patient.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-ink-muted" />
                {patient.email}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Tabs and Detail Content */}
        <div className="mt-6">
          <Suspense fallback={<div className="text-sm text-ink-muted">Loading chart...</div>}>
            <PatientDetail patientId={patient.id} />
          </Suspense>
        </div>
      </div>
    </AppPage>
  );
}
