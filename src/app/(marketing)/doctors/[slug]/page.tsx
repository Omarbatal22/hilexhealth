import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Languages,
  MapPin,
  Stethoscope,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingWidget } from "@/components/sections/doctors/booking-widget";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { StarRating } from "@/components/ui/star-rating";
import { DOCTORS, getDoctor } from "@/lib/doctors";

export function generateStaticParams() {
  return DOCTORS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  props: PageProps<"/doctors/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const doctor = getDoctor(slug);
  if (!doctor) return { title: "Doctor not found | HelixHealth" };
  return {
    title: `${doctor.name} — ${doctor.specialty} | HelixHealth`,
    description: doctor.bio,
  };
}

export default async function DoctorProfilePage(
  props: PageProps<"/doctors/[slug]">
) {
  const { slug } = await props.params;
  const doctor = getDoctor(slug);
  if (!doctor) notFound();

  return (
    <div className="bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-20">
      <Container className="pt-8">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ---------------- Main column ---------------- */}
          <div className="space-y-6">
            {/* Header card */}
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary to-primary-light" />
              <CardBody className="-mt-12">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="relative">
                    <Avatar name={doctor.name} size="xl" ring />
                    <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-white p-0.5">
                      <BadgeCheck className="h-6 w-6 text-primary" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
                        {doctor.name}
                      </h1>
                      <Badge tone="primary" size="sm">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </Badge>
                    </div>
                    <p className="mt-1 text-ink-soft">{doctor.title}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <StarRating
                    rating={doctor.rating}
                    count={doctor.reviewCount}
                    size="md"
                  />
                  <Meta icon={MapPin} text={`${doctor.location} · ${doctor.distanceMi} mi`} />
                  <Meta icon={Briefcase} text={`${doctor.experienceYears} years experience`} />
                  <Meta icon={Stethoscope} text={doctor.specialty} />
                </div>
              </CardBody>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {doctor.name.split(" ").slice(0, 2).join(" ")}</CardTitle>
              </CardHeader>
              <CardBody className="-mt-2">
                <p className="leading-7 text-ink-soft">{doctor.bio}</p>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <InfoBlock icon={Languages} title="Languages">
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((l) => (
                        <Badge key={l} tone="neutral" size="sm">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </InfoBlock>
                  <InfoBlock icon={Stethoscope} title="Focus areas">
                    <div className="flex flex-wrap gap-2">
                      {doctor.focusAreas.map((f) => (
                        <Badge key={f} tone="primary" size="sm">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </InfoBlock>
                </div>

                <div className="mt-6">
                  <InfoBlock icon={GraduationCap} title="Education & training">
                    <ul className="space-y-2">
                      {doctor.education.map((e) => (
                        <li
                          key={e}
                          className="flex gap-2.5 text-sm text-ink-soft"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </InfoBlock>
                </div>
              </CardBody>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Patient reviews</CardTitle>
                <StarRating rating={doctor.rating} count={doctor.reviewCount} />
              </CardHeader>
              <CardBody className="-mt-2 space-y-4">
                {doctor.reviews.map((r) => (
                  <div
                    key={r.author}
                    className="rounded-2xl border border-border-soft bg-surface/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.author} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {r.author}
                          </p>
                          <p className="text-xs text-ink-muted">{r.date}</p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink-soft">
                      {r.body}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* ---------------- Sticky booking ---------------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingWidget doctor={doctor} />
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Meta({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <Icon className="h-4 w-4 text-ink-muted" />
      {text}
    </span>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );
}
