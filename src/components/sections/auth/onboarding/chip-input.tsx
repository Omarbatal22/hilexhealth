import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChipInputProps {
  placeholder?: string;
  values: string[];
  onChange: (newValues: string[]) => void;
}

export function ChipInput({ placeholder, values, onChange }: ChipInputProps) {
  const [inputVal, setInputVal] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed && !values.includes(trimmed)) {
        onChange([...values, trimmed]);
        setInputVal("");
      }
    } else if (e.key === "Backspace" && !inputVal && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeChip = (indexToRemove: number) => {
    onChange(values.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type and press Enter..."}
          className="w-full"
        />
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border-soft bg-surface/50 min-h-[44px]">
          {values.map((val, idx) => (
            <Badge
              key={idx}
              tone="primary"
              size="md"
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full"
            >
              <span>{val}</span>
              <button
                type="button"
                onClick={() => removeChip(idx)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                aria-label={`Remove ${val}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
