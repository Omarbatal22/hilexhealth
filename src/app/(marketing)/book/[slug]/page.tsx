import { ArrowLeft, CalendarCheck, Clock, MapPin, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DOCTORS, getDoctor } from "@/lib/doctors";

export function generateStaticParams() {
  return DOCTORS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  props: PageProps<"/book/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const doctor = getDoctor(slug);
  return { title: doctor ? `Book ${doctor.name} | HelixHealth` : "Book | HelixHealth" };
}

export default async function BookPage(props: PageProps<"/book/[slug]">) {
  const { slug } = await props.params;
  const doctor = getDoctor(slug);
  if (!doctor) notFound();

  return (
    <div className="bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-20">
      <Container className="max-w-3xl pt-8">
        <Link
          href={`/doctors/${doctor.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>

        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Confirm your appointment
        </h1>
        <p className="mt-2 text-ink-soft">
          Review the details below and confirm. You&apos;ll receive a reminder
          before your visit.
        </p>

        {/* Doctor summary */}
        <Card className="mt-7">
          <CardBody className="flex items-center gap-4">
            <Avatar name={doctor.name} size="lg" ring />
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-navy">
                {doctor.name}
              </p>
              <p className="text-sm text-ink-soft">{doctor.title}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-ink-muted">Fee</p>
              <p className="font-display text-xl font-bold text-navy">
                ${doctor.feeUsd}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Appointment details */}
        <Card className="mt-4">
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Detail icon={CalendarCheck} label="Date" value={doctor.nextAvailable.split(",")[0]} />
            <Detail icon={Clock} label="Time" value={doctor.nextAvailable.split(", ")[1] ?? "4:30 PM"} />
            <Detail
              icon={doctor.videoVisit ? Video : MapPin}
              label="Visit type"
              value={doctor.videoVisit ? "Video visit" : "In-person"}
            />
            <Detail icon={MapPin} label="Location" value={doctor.location} />
          </CardBody>
        </Card>

        {/* Visit reason */}
        <Card className="mt-4">
          <CardBody>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-bold text-navy"
            >
              Reason for visit{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              placeholder="Briefly describe your symptoms or reason for the appointment..."
              className="w-full resize-none rounded-2xl border border-border-soft bg-white px-4 py-3 text-[15px] text-navy placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
          </CardBody>
        </Card>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" size="lg" className="flex-1">
            <CalendarCheck className="h-5 w-5" /> Confirm appointment
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/doctors">Choose another doctor</Link>
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          <Badge tone="success" size="sm">
            Free cancellation
          </Badge>{" "}
          up to 24 hours before your appointment
        </p>
      </Container>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-sm font-semibold text-navy">{value}</p>
      </div>
    </div>
  );
}
