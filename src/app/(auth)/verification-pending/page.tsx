import type { Metadata } from "next";
import Link from "next/link";
import { Clock, CheckCircle2, Home, LayoutDashboard } from "lucide-react";
import { AuthShell } from "@/components/sections/auth/auth-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Verification Pending | HelixHealth",
  description: "Your provider application is currently under review.",
};

export default function VerificationPendingPage() {
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="text-center sm:text-left space-y-2">
          <Badge tone="warning" size="md" className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Under review
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
            Application Received
          </h1>
          <p className="text-sm text-ink-soft leading-relaxed">
            Thank you for applying to join the HelixHealth medical network. Our credentialing team is reviewing your details.
          </p>
        </div>

        {/* Process Timeline Card */}
        <Card className="border border-border-soft bg-surface/50">
          <CardBody className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-navy">Verification checklist</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-xs text-ink-soft">
                <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-navy">Basic info & practice details</p>
                  <p className="text-ink-muted">Specialty and branch settings compiled.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-ink-soft">
                <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-navy">Document upload completed</p>
                  <p className="text-ink-muted">Medical license and national ID file names registered.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-ink-soft">
                <Clock className="h-4.5 w-4.5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-navy">Medical license check</p>
                  <p className="text-ink-muted">Syndicate registries verification in progress (1–3 business days).</p>
                </div>
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Informative Note */}
        <div className="rounded-xl border border-primary-soft bg-primary-soft/10 p-4">
          <p className="text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-navy">Need to make updates?</span> If you submitted incorrect information, please contact our support team at <span className="font-semibold text-primary">providers@helixhealth.com</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-soft">
          <Button variant="outline" className="w-full justify-center gap-2" asChild>
            <Link href="/">
              <Home className="h-4 w-4" /> Back to home
            </Link>
          </Button>
          <Button variant="primary" className="w-full justify-center gap-2" asChild>
            <Link href="/provider/dashboard">
              <LayoutDashboard className="h-4 w-4" /> Limited Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
