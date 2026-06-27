"use client";

import * as React from "react";
import { type Branch, isOpenNow } from "@/lib/clinics";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function OpenNowPill({ branch }: { branch: Branch }) {
  const [open, setOpen] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const timerId = setTimeout(() => {
      setOpen(isOpenNow(branch, new Date()));
    }, 0);
    
    const intervalId = setInterval(() => {
      setOpen(isOpenNow(branch, new Date()));
    }, 60000);

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [branch]);

  if (open === null) {
    return (
      <Badge tone="neutral" className="gap-1 bg-surface text-ink-muted/50 border border-border-soft">
        <Clock className="h-3 w-3 shrink-0" />
        <span>Checking...</span>
      </Badge>
    );
  }

  return open ? (
    <Badge tone="success" className="gap-1">
      <Clock className="h-3 w-3 shrink-0" />
      <span>Open now</span>
    </Badge>
  ) : (
    <Badge tone="neutral" className="gap-1 bg-surface text-ink-muted border border-border-soft">
      <Clock className="h-3 w-3 shrink-0" />
      <span>Closed</span>
    </Badge>
  );
}
