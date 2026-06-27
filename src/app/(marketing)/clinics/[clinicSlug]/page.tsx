import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ClinicBadge } from "@/components/ui/clinic-badge";
import { FacilityBadge } from "@/components/ui/facility-badge";
import { InsuranceBadge } from "@/components/ui/insurance-badge";
import { ClinicGallery } from "@/components/sections/clinics/clinic-gallery";
import { ClinicStatistics } from "@/components/sections/clinics/clinic-statistics";
import { RelatedClinics } from "@/components/sections/clinics/related-clinics";
import { BranchCard } from "@/components/sections/clinics/branch-card";
import { ClinicDoctorsSection } from "@/components/sections/clinics/clinic-doctors-section";
import { CLINICS, getClinic, getBranchesForClinic, AMENITIES, SERVICES, INSURANCERS } from "@/lib/clinics";

export function generateStaticParams() {
  return CLINICS.map((c) => ({ clinicSlug: c.slug }));
}

interface PageParams {
  params: Promise<{ clinicSlug: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { clinicSlug } = await params;
  const clinic = getClinic(clinicSlug);
  if (!clinic) return { title: "Facility Not Found | HelixHealth" };
  return {
    title: `${clinic.name} | HelixHealth`,
    description: clinic.tagline,
  };
}

export default async function ClinicDetailPage({ params }: PageParams) {
  const { clinicSlug } = await params;
  const clinic = getClinic(clinicSlug);
  if (!clinic) notFound();

  const branches = getBranchesForClinic(clinic.id);

  // Map amenities & services & insurances from IDs
  const resolvedAmenities = clinic.amenityIds
    .map((id) => AMENITIES.find((a) => a.id === id))
    .filter(Boolean);

  const resolvedServices = clinic.serviceIds
    .map((id) => SERVICES.find((s) => s.id === id))
    .filter(Boolean);

  const resolvedInsurances = clinic.insuranceIds
    .map((id) => INSURANCERS.find((i) => i.id === id))
    .filter(Boolean);

  return (
    <section className="bg-soft-bg pb-20 pt-6">
      <Container>
        {/* Back Link */}
        <Link
          href="/clinics"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        {/* Hero Composition */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            <ClinicGallery />

            {/* Profile Intro Card */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
                      {clinic.name}
                    </h1>
                    <ClinicBadge type={clinic.type} />
                  </div>
                  <p className="text-base text-ink-soft mt-1.5">{clinic.tagline}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <ShieldCheck className="h-4 w-4" /> Verified Facility
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-soft/60 pt-4">
                <StarRating rating={clinic.rating} count={clinic.reviewCount} />
                <span className="text-sm text-ink-muted">
                  {branches.length} {branches.length === 1 ? "branch" : "branches"} in Egypt
                </span>
              </div>
            </Card>

            {/* Description & Specialties */}
            <Card className="p-6">
              <h2 className="font-display font-bold text-navy text-lg mb-3">About Us</h2>
              <p className="text-sm text-ink-soft leading-relaxed">{clinic.description}</p>

              <h3 className="font-semibold text-navy text-sm mt-5 mb-2">Available Services</h3>
              <div className="flex flex-wrap gap-2">
                {resolvedServices.map((service) => (
                  <Badge key={service!.id} tone="primary" size="sm">
                    {service!.label}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Branches Card List */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-navy text-lg">Our Branch Locations</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {branches.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} clinicSlug={clinic.slug} />
                ))}
              </div>
            </div>

            {/* Clinic Doctors Availability List */}
            <ClinicDoctorsSection branches={branches} />

            {/* Insurance Card */}
            <Card className="p-6">
              <h2 className="font-display font-bold text-navy text-lg mb-3">Accepted Insurance Providers</h2>
              <div className="flex flex-wrap gap-2">
                {resolvedInsurances.map((ins) => (
                  <InsuranceBadge key={ins!.id} insurance={ins!} />
                ))}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="p-6">
              <h2 className="font-display font-bold text-navy text-lg mb-4">Patient Reviews</h2>
              <div className="space-y-4">
                {clinic.reviews.map((r, i) => (
                  <div key={i} className="border-b border-border-soft pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-navy text-sm">{r.author}</span>
                      <span className="text-xs text-ink-muted">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 ${
                            idx < r.rating ? "fill-warning text-warning" : "text-border-soft"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="p-5 bg-gradient-to-br from-primary-bg to-white border border-primary/20 shadow-medium">
                <h3 className="font-display font-bold text-navy text-base mb-2">Book an Appointment</h3>
                <p className="text-xs text-ink-soft mb-4">
                  Select any branch and schedule a visit with one of our certified specialists.
                </p>
                <Button variant="primary" className="w-full shadow-md" asChild>
                  <Link href={`/book?clinic=${clinic.slug}`}>Book Now</Link>
                </Button>
              </Card>

              <Card className="p-5">
                <h3 className="font-display font-bold text-navy text-base mb-3 font-semibold">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {resolvedAmenities.map((amenity) => (
                    <FacilityBadge key={amenity!.id} amenity={amenity!} />
                  ))}
                </div>
              </Card>

              <ClinicStatistics facility={clinic} />

              <RelatedClinics facility={clinic} />
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
