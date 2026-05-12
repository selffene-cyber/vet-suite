"use client";

import { cn } from "@/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full rounded-t-2xl bg-background p-6 shadow-lg max-h-[80vh] overflow-y-auto safe-bottom">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        {title && <h3 className="mb-4 text-base font-semibold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FilterSheet({ open, onClose, children }: FilterSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filtros">
      {children}
    </BottomSheet>
  );
}