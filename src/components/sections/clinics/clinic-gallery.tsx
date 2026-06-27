import * as React from "react";
import { Image as ImageIcon } from "lucide-react";

export function ClinicGallery() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl overflow-hidden h-64 sm:h-48">
      <div className="sm:col-span-2 bg-gradient-to-br from-primary-soft to-primary/20 flex flex-col justify-end p-5 relative group cursor-pointer">
        <div className="absolute inset-0 bg-navy/10 group-hover:bg-navy/20 transition-all duration-300" />
        <ImageIcon className="h-6 w-6 text-primary relative z-10 mb-2" />
        <span className="text-xs font-bold text-navy relative z-10">Main Lobby & Reception</span>
      </div>
      <div className="grid grid-rows-2 gap-3">
        <div className="bg-gradient-to-br from-teal/10 to-teal/20 flex flex-col justify-end p-3 relative group cursor-pointer">
          <span className="text-[10px] font-bold text-teal-800 relative z-10">Consultation Suite</span>
        </div>
        <div className="bg-gradient-to-br from-ai/10 to-ai/20 flex flex-col justify-end p-3 relative group cursor-pointer">
          <span className="text-[10px] font-bold text-ai relative z-10">Diagnostic Lab</span>
        </div>
      </div>
    </div>
  );
}
