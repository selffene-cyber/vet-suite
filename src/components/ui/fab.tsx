"use client";

import { cn } from "@/utils";

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FAB({ onClick, icon, label, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-4 sm:bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all",
        className
      )}
      aria-label={label || "Agregar"}
    >
      {icon || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}