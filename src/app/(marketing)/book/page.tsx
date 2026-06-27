import type { Metadata } from "next";
import { BookingWizard } from "@/components/sections/booking/booking-wizard";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Book Appointment | HelixHealth",
  description: "Schedule your online video consultation or in-person checkup with our medical specialists in Cairo, Giza, and Alexandria.",
};

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink-muted">Loading Booking Form...</div>}>
      <BookingWizard />
    </Suspense>
  );
}
