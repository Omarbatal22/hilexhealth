"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  Building,
  User,
  ChevronLeft,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Container } from "@/components/ui/container";
import { DOCTORS, getDoctor, AVAILABILITY_DAYS, type Doctor } from "@/lib/doctors";
import {
  CLINICS,
  BRANCHES,
  type MedicalFacility,
  type Branch,
  getClinicsForDoctor,
  getBranchesForClinic,
  getScheduleForDoctorAtBranch,
} from "@/lib/clinics";

export function BookingWizard() {
  const searchParams = useSearchParams();

  // Selected Entities initialized directly from URL parameters during render/mount
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(() => {
    const docParam = searchParams.get("doctor");
    return docParam ? getDoctor(docParam) || null : null;
  });

  const [selectedClinic, setSelectedClinic] = React.useState<MedicalFacility | null>(() => {
    const clinicParam = searchParams.get("clinic");
    return clinicParam ? CLINICS.find((c) => c.slug === clinicParam) || null : null;
  });

  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(() => {
    const branchParam = searchParams.get("branch");
    return branchParam ? BRANCHES.find((b) => b.slug === branchParam) || null : null;
  });

  const [selectedDate, setSelectedDate] = React.useState<string | null>(() => searchParams.get("date"));
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(() => searchParams.get("time"));
  const [reason, setReason] = React.useState("");

  const [isConfirmed, setIsConfirmed] = React.useState(false);

  // Compute Options dynamically based on selections
  const clinicsOptions = React.useMemo(() => {
    if (!selectedDoctor) return CLINICS;
    return getClinicsForDoctor(selectedDoctor.slug);
  }, [selectedDoctor]);

  const branchesOptions = React.useMemo(() => {
    if (!selectedClinic) return [];
    let list = getBranchesForClinic(selectedClinic.id);
    if (selectedDoctor) {
      // Filter branches where this doctor practices
      list = list.filter((b) => b.doctorIds.includes(selectedDoctor.slug));
    }
    return list;
  }, [selectedClinic, selectedDoctor]);

  const slotsOptions = React.useMemo(() => {
    if (!selectedDoctor || !selectedBranch) return [];
    const schedule = getScheduleForDoctorAtBranch(selectedDoctor.slug, selectedBranch.id);
    return schedule?.slots || ["9:00 AM", "10:30 AM", "2:15 PM", "4:30 PM"];
  }, [selectedDoctor, selectedBranch]);

  // Auto-skip logic helper: runs synchronously in render
  // Step 1: Doctor Select
  // Step 2: Clinic Select
  // Step 3: Branch Select
  // Step 4: Date Select
  // Step 5: Time Select
  // Step 6: Confirmation Screen

  // Active step calculation
  let step = 1;
  if (selectedDoctor) {
    step = 2;
    if (selectedClinic) {
      step = 3;
      if (selectedBranch) {
        step = 4;
        if (selectedDate) {
          step = 5;
          if (selectedSlot) {
            step = 6;
          }
        }
      }
    }
  }

  // Handle resets/navigation backwards
  const handleBack = () => {
    if (step === 6) setSelectedSlot(null);
    else if (step === 5) setSelectedDate(null);
    else if (step === 4) setSelectedBranch(null);
    else if (step === 3) setSelectedClinic(null);
    else if (step === 2) setSelectedDoctor(null);
  };

  const resetSelections = () => {
    setSelectedDoctor(null);
    setSelectedClinic(null);
    setSelectedBranch(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setReason("");
  };

  // If already confirmed, render success view
  if (isConfirmed) {
    return (
      <Container className="max-w-md pt-12 pb-20 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success mb-6">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
          Appointment Booked!
        </h1>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Your visit with <span className="font-semibold text-navy">{selectedDoctor?.name}</span> at{" "}
          <span className="font-semibold text-navy">{selectedClinic?.name} ({selectedBranch?.name})</span> is confirmed.
        </p>

        <Card className="mt-8 text-left bg-surface/50 border border-border-soft">
          <CardBody className="p-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">Doctor:</span>
              <span className="font-semibold text-navy">{selectedDoctor?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">Date:</span>
              <span className="font-semibold text-navy">{selectedDate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">Time:</span>
              <span className="font-semibold text-navy">{selectedSlot}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">Branch:</span>
              <span className="font-semibold text-navy">{selectedBranch?.name}</span>
            </div>
          </CardBody>
        </Card>

        <div className="mt-8 flex flex-col gap-3">
          <Button variant="primary" className="w-full" asChild>
            <Link href="/dashboard">Go to Patient Dashboard</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-20">
      <Container className="max-w-3xl pt-8">
        {/* Navigation Breadcrumb/Back link */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to previous step
            </button>
          ) : (
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel booking
            </Link>
          )}
          <span className="text-xs text-ink-muted font-mono">Step {step} of 6</span>
        </div>

        {/* Dynamic headings */}
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {step === 1 && "Choose a Doctor"}
          {step === 2 && "Choose a Medical Center"}
          {step === 3 && "Select Branch Location"}
          {step === 4 && "Choose Appointment Date"}
          {step === 5 && "Select Time Slot"}
          {step === 6 && "Confirm your Appointment"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {step === 1 && "Select from our certified clinicians to begin your booking."}
          {step === 2 && "Choose a clinic or medical center that best suits your location."}
          {step === 3 && "Pick one of the active branch offices."}
          {step === 4 && "Select a convenient date for your session."}
          {step === 5 && "Choose an available time slot."}
          {step === 6 && "Review details below and click confirm to finish booking."}
        </p>

        {/* Stepper Summary chips */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {selectedDoctor && (
            <Badge tone="primary" size="md" className="gap-1.5 border border-primary/20">
              <User className="h-3.5 w-3.5" />
              {selectedDoctor.name}
            </Badge>
          )}
          {selectedClinic && (
            <Badge tone="teal" size="md" className="gap-1.5 border border-teal/20">
              <Building className="h-3.5 w-3.5" />
              {selectedClinic.name}
            </Badge>
          )}
          {selectedBranch && (
            <Badge tone="neutral" size="md" className="gap-1.5 border border-border-soft">
              <MapPin className="h-3.5 w-3.5" />
              {selectedBranch.name}
            </Badge>
          )}
          {selectedDate && (
            <Badge tone="success" size="md" className="gap-1.5 border border-success/20">
              <CalendarDays className="h-3.5 w-3.5" />
              {selectedDate}
            </Badge>
          )}
        </div>

        <div className="mt-7">
          {/* STEP 1: Select Doctor */}
          {step === 1 && (
            <div className="grid gap-4">
              {DOCTORS.map((doc) => (
                <Card
                  key={doc.slug}
                  interactive
                  onClick={() => setSelectedDoctor(doc)}
                  className="p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={doc.name} size="lg" ring />
                    <div>
                      <h3 className="font-semibold text-navy text-base">{doc.name}</h3>
                      <p className="text-xs text-ink-soft">{doc.title}</p>
                      <div className="mt-1">
                        <StarRating rating={doc.rating} count={doc.reviewCount} size="sm" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 2: Select Clinic */}
          {step === 2 && (
            <div className="grid gap-4">
              {clinicsOptions.map((clin) => (
                <Card
                  key={clin.id}
                  interactive
                  onClick={() => setSelectedClinic(clin)}
                  className="p-4"
                >
                  <div>
                    <h3 className="font-semibold text-navy text-base">{clin.name}</h3>
                    <p className="text-xs text-ink-soft mt-0.5">{clin.tagline}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating rating={clin.rating} count={clin.reviewCount} size="sm" />
                      <span className="text-[10px] text-ink-muted">({clin.branchIds.length} branches)</span>
                    </div>
                  </div>
                </Card>
              ))}
              {clinicsOptions.length === 0 && (
                <div className="text-center py-10 bg-white border border-dashed rounded-2xl">
                  <p className="text-sm text-ink-muted">No clinics available for this doctor.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Select Branch */}
          {step === 3 && (
            <div className="grid gap-4">
              {branchesOptions.map((br) => (
                <Card
                  key={br.id}
                  interactive
                  onClick={() => setSelectedBranch(br)}
                  className="p-4"
                >
                  <div>
                    <h3 className="font-semibold text-navy text-base">{br.name}</h3>
                    <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-ink-muted" />
                      {br.address.street}, {br.address.area}, {br.address.governorate}
                    </p>
                  </div>
                </Card>
              ))}
              {branchesOptions.length === 0 && (
                <div className="text-center py-10 bg-white border border-dashed rounded-2xl">
                  <p className="text-sm text-ink-muted">No branches available for this clinic.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Choose Date */}
          {step === 4 && (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {AVAILABILITY_DAYS.map((d) => (
                <Card
                  key={d.date}
                  interactive={d.slots > 0}
                  onClick={() => d.slots > 0 && setSelectedDate(`${d.day}, ${d.date}`)}
                  className={`p-4 text-center ${d.slots === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <p className="text-xs text-ink-muted">{d.day}</p>
                  <p className="text-lg font-bold text-navy mt-1">{d.date}</p>
                  <p className="text-[10px] font-semibold text-success mt-2">
                    {d.slots > 0 ? `${d.slots} slots available` : "Fully booked"}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 5: Choose Time Slot */}
          {step === 5 && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {slotsOptions.map((slot) => (
                <Card
                  key={slot}
                  interactive
                  onClick={() => setSelectedSlot(slot)}
                  className="p-3 text-center"
                >
                  <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-sm font-semibold text-navy">{slot}</p>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 6: Confirmation Screen */}
          {step === 6 && selectedDoctor && selectedClinic && selectedBranch && (
            <div className="space-y-4">
              {/* Doctor Summary */}
              <Card>
                <CardBody className="flex items-center gap-4">
                  <Avatar name={selectedDoctor.name} size="lg" ring />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-navy">{selectedDoctor.name}</p>
                    <p className="text-sm text-ink-soft">{selectedDoctor.title}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-ink-muted">Consultation Fee</p>
                    <p className="font-display text-xl font-bold text-navy">
                      ${getScheduleForDoctorAtBranch(selectedDoctor.slug, selectedBranch.id)?.feeUsd || selectedDoctor.feeUsd}
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Detail Items */}
              <Card>
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-ink-muted">Appointment Date</p>
                      <p className="text-sm font-semibold text-navy">{selectedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <Clock className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-ink-muted">Appointment Time</p>
                      <p className="text-sm font-semibold text-navy">{selectedSlot}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      {selectedDoctor.videoVisit ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="text-xs text-ink-muted">Facility Type</p>
                      <p className="text-sm font-semibold text-navy">
                        {selectedDoctor.videoVisit ? "Video visit" : "In-person"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <Building className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs text-ink-muted">Branch Location</p>
                      <p className="text-sm font-semibold text-navy line-clamp-1">
                        {selectedBranch.name} ({selectedClinic.name})
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Text Area Reason */}
              <Card>
                <CardBody>
                  <label htmlFor="reason" className="mb-2 block text-sm font-bold text-navy">
                    Reason for visit <span className="font-normal text-ink-muted">(optional)</span>
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for the appointment..."
                    className="w-full resize-none rounded-2xl border border-border-soft bg-white px-4 py-3 text-[15px] text-navy placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  />
                </CardBody>
              </Card>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" size="lg" className="flex-1 gap-2" onClick={() => setIsConfirmed(true)}>
                  <CalendarDays className="h-5 w-5" /> Confirm Appointment
                </Button>
                <Button variant="outline" size="lg" onClick={resetSelections}>
                  Choose Another Doctor
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
