import * as React from "react";
import { Clock } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { type WeeklyHours } from "@/lib/clinics";

export function WorkingHoursCard({ workingHours }: { workingHours: WeeklyHours }) {
  const days: { key: keyof WeeklyHours; label: string }[] = [
    { key: "sun", label: "Sunday" },
    { key: "mon", label: "Monday" },
    { key: "tue", label: "Tuesday" },
    { key: "wed", label: "Wednesday" },
    { key: "thu", label: "Thursday" },
    { key: "fri", label: "Friday" },
    { key: "sat", label: "Saturday" },
  ];

  const todayIndex = new Date().getDay();
  const todayKey = days[todayIndex].key;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-navy text-base">
          <Clock className="h-4 w-4 text-primary" />
          Working Hours
        </CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        <div className="divide-y divide-border-soft/60">
          {days.map((d) => {
            const hours = workingHours[d.key];
            const isToday = d.key === todayKey;
            return (
              <div
                key={d.key}
                className={`flex justify-between items-center py-2.5 px-4 text-sm ${
                  isToday ? "bg-primary-soft/30 font-semibold text-primary" : "text-ink-soft"
                }`}
              >
                <span>{d.label}</span>
                <span>
                  {hours === "closed" ? (
                    <span className="text-ink-muted">Closed</span>
                  ) : (
                    `${hours.open} - ${hours.close}`
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
