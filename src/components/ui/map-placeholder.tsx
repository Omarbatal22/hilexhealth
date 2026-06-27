import * as React from "react";
import { MapPin, Navigation } from "lucide-react";

interface MapPlaceholderProps {
  lat: number;
  lng: number;
  address: string;
  className?: string;
}

export function MapPlaceholder({ lat, lng, address, className }: MapPlaceholderProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-border-soft bg-gradient-to-br from-[#f8fafc] to-surface p-6 text-center shadow-soft ${className}`}>
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 shadow-sm">
        <MapPin className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-navy max-w-sm mb-4 leading-relaxed">
        {address}
      </p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-light transition-all duration-200"
      >
        <Navigation className="h-3.5 w-3.5" />
        Get Directions
      </a>
    </div>
  );
}
