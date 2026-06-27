import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, MapPin, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLINICS, getClinic, getBranch, getBranchesForClinic } from "@/lib/clinics";
import { getDoctor } from "@/lib/doctors";
import { WorkingHoursCard } from "@/components/sections/clinics/working-hours-card";
import { DirectionsCard } from "@/components/sections/clinics/directions-card";
import { MapPlaceholder } from "@/components/ui/map-placeholder";
import { DoctorAvailabilityCard } from "@/components/sections/clinics/doctor-availability-card";

export function generateStaticParams() {
  const params: { clinicSlug: string; branchSlug: string }[] = [];
  CLINICS.forEach((c) => {
    const branches = getBranchesForClinic(c.id);
    branches.forEach((b) => {
      params.push({ clinicSlug: c.slug, branchSlug: b.slug });
    });
  });
  return params;
}

interface PageParams {
  params: Promise<{ clinicSlug: string; branchSlug: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { clinicSlug, branchSlug } = await params;
  const branch = getBranch(clinicSlug, branchSlug);
  if (!branch) return { title: "Branch Not Found | HelixHealth" };
  return {
    title: `${branch.name} - ${clinicSlug} | HelixHealth`,
    description: `Contact and working hours for ${branch.name}.`,
  };
}

export default async function BranchDetailPage({ params }: PageParams) {
  const { clinicSlug, branchSlug } = await params;
  const clinic = getClinic(clinicSlug);
  if (!clinic) notFound();

  const branch = getBranch(clinicSlug, branchSlug);
  if (!branch) notFound();

  // Find doctors working at this branch
  const branchDoctors = branch.doctorIds.map((id) => getDoctor(id)).filter(Boolean);

  const fullAddress = `${branch.address.street}, ${branch.address.area}, ${branch.address.city}, ${branch.address.governorate}`;

  return (
    <section className="bg-soft-bg pb-20 pt-6">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-ink-soft mb-6 flex-wrap">
          <Link href="/clinics" className="hover:text-primary transition-colors">
            Clinics
          </Link>
          <ChevronRight className="h-3 w-3 text-ink-muted" />
          <Link href={`/clinics/${clinic.slug}`} className="hover:text-primary transition-colors">
            {clinic.name}
          </Link>
          <ChevronRight className="h-3 w-3 text-ink-muted" />
          <span className="text-ink-muted">{branch.name}</span>
        </nav>

        {/* Back Link */}
        <Link
          href={`/clinics/${clinic.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clinic profile
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Header info */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
                    {branch.name}
                  </h1>
                  <p className="text-sm text-ink-soft mt-1.5">{clinic.name}</p>
                </div>
                <Badge tone="primary" size="sm">
                  Active Branch
                </Badge>
              </div>

              <div className="mt-4 flex items-start gap-2 border-t border-border-soft/60 pt-4 text-sm text-ink-soft">
                <MapPin className="h-4 w-4 text-ink-muted mt-0.5 shrink-0" />
                <span>{fullAddress}</span>
              </div>
            </Card>

            {/* Doctors list */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-navy text-lg">Doctors at this Branch</h2>
              <div className="space-y-4">
                {branchDoctors.length > 0 ? (
                  branchDoctors.map((doc) => (
                    <DoctorAvailabilityCard
                      key={doc!.slug}
                      doctor={doc!}
                      branch={branch}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 bg-white border border-border-soft rounded-2xl">
                    <p className="text-sm text-ink-muted">No doctors scheduled at this branch.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Parking & Accessibility card */}
            <Card className="p-6">
              <h2 className="font-display font-bold text-navy text-lg mb-4">Branch Facilities</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-border-soft/50">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                    branch.parking ? "bg-success" : "bg-ink-muted/30"
                  }`}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-navy">On-site Parking</h4>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {branch.parking ? "Dedicated patient parking is available." : "Street parking is available nearby."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-border-soft/50">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                    branch.wheelchair ? "bg-success" : "bg-ink-muted/30"
                  }`}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-navy">Wheelchair Access</h4>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {branch.wheelchair ? "Fully accessible ramps and elevators." : "Ramp access is not currently installed."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="p-5 bg-gradient-to-br from-primary-bg to-white border border-primary/20 shadow-medium">
                <h3 className="font-display font-bold text-navy text-base mb-2">Book Appointment</h3>
                <p className="text-xs text-ink-soft mb-4">
                  Schedule an online or physical consultation at this specific branch.
                </p>
                <Button variant="primary" className="w-full" asChild>
                  <Link href={`/book?clinic=${clinic.slug}&branch=${branch.slug}`}>
                    Book Now
                  </Link>
                </Button>
              </Card>

              <MapPlaceholder
                lat={branch.geo.lat}
                lng={branch.geo.lng}
                address={fullAddress}
              />

              <WorkingHoursCard workingHours={branch.workingHours} />

              <DirectionsCard branch={branch} />
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
