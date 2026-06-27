import * as React from "react";
import { Phone, Mail } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { type Branch } from "@/lib/clinics";

export function DirectionsCard({ branch }: { branch: Branch }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-navy">Contact & Directions</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <Phone className="h-4 w-4 text-ink-muted shrink-0" />
          <a href={`tel:${branch.phone}`} className="hover:text-primary transition-colors">
            {branch.phone}
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <Mail className="h-4 w-4 text-ink-muted shrink-0" />
          <span>contact@helixhealth.com</span>
        </div>
        <div className="pt-3 border-t border-border-soft">
          <p className="text-xs text-ink-muted mb-1">Coordinates</p>
          <p className="text-xs font-mono text-ink-soft">
            {branch.geo.lat.toFixed(4)}° N, {branch.geo.lng.toFixed(4)}° E
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
