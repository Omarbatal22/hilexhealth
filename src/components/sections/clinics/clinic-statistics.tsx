import * as React from "react";
import { Users, ClipboardList, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type MedicalFacility, getBranchesForClinic } from "@/lib/clinics";

export function ClinicStatistics({ facility }: { facility: MedicalFacility }) {
  const branchCount = getBranchesForClinic(facility.id).length;
  
  const uniqueDocCount = React.useMemo(() => {
    const docs = new Set<string>();
    getBranchesForClinic(facility.id).forEach(b => b.doctorIds.forEach(id => docs.add(id)));
    return docs.size;
  }, [facility]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-3 text-center bg-white border border-border-soft">
        <MapPin className="h-4 w-4 text-primary mx-auto mb-1" />
        <p className="text-base font-bold text-navy">{branchCount}</p>
        <p className="text-[10px] text-ink-muted uppercase tracking-wider">Branches</p>
      </Card>
      <Card className="p-3 text-center bg-white border border-border-soft">
        <Users className="h-4 w-4 text-teal mx-auto mb-1" />
        <p className="text-base font-bold text-navy">{uniqueDocCount}</p>
        <p className="text-[10px] text-ink-muted uppercase tracking-wider">Doctors</p>
      </Card>
      <Card className="p-3 text-center bg-white border border-border-soft">
        <ClipboardList className="h-4 w-4 text-coral mx-auto mb-1" />
        <p className="text-base font-bold text-navy">{facility.specialtySlugs.length}</p>
        <p className="text-[10px] text-ink-muted uppercase tracking-wider">Specialties</p>
      </Card>
    </div>
  );
}
