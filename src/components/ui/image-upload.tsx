"use client";

import { useRef, useState } from "react";
import { cn } from "@/utils";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (file: File) => void;
  preview?: string;
  className?: string;
}

export function ImageUpload({ label, value, onChange, preview, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayPreview = localPreview || preview || value;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          dragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 text-muted-foreground hover:bg-accent"
        )}
      >
        {displayPreview ? (
          <img src={displayPreview} alt={label} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </button>
    </div>
  );
}