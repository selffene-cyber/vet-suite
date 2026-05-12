"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/utils";

interface TutorOption {
  id: string;
  nombre_completo: string;
  rut: string;
  telefono: string;
}

interface TutorSearchProps {
  label?: string;
  placeholder?: string;
  value: string;
  tutorName?: string;
  onChange: (id: string, tutor: TutorOption | null) => void;
  onCreateNew: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function TutorSearch({ label, placeholder, value, tutorName, onChange, onCreateNew, disabled, error, className }: TutorSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TutorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchTutors = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(`/api/tutors?search=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults((data.tutors || []) as TutorOption[]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchTutors(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, open, searchTutors]);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(!open);
    if (!open) {
      setQuery("");
      setResults([]);
      setSearched(false);
    }
  };

  const handleSelect = (tutor: TutorOption) => {
    onChange(tutor.id, tutor);
    setOpen(false);
    setQuery("");
  };

  const clearSelection = () => {
    onChange("", null);
  };

  return (
    <div className={cn("w-full", className)} ref={ref}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {value && tutorName ? (
        <div className={cn(
          "flex h-12 w-full items-center rounded-md border bg-background px-3 py-2 text-base",
          error ? "border-destructive" : "border-input"
        )}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{tutorName}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          className={cn(
            "flex h-12 w-full items-center rounded-md border bg-background px-3 py-2 text-base text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive" : "border-input",
            "text-muted-foreground"
          )}
        >
          <span className="flex-1 truncate">{placeholder || "Buscar tutor..."}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 shrink-0 text-muted-foreground">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {open && (
        <div className="relative z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Buscar por nombre, RUT, teléfono o correo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto overscroll-contain p-1">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
              </div>
            )}
            {!loading && searched && results.length === 0 && query.trim() && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">No se encontraron tutores</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onCreateNew();
                  }}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear nuevo tutor
                </button>
              </div>
            )}
            {!loading && !searched && !query.trim() && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Escriba para buscar un tutor
              </p>
            )}
            {!loading && results.length > 0 && results.map((tutor) => (
              <button
                key={tutor.id}
                type="button"
                onClick={() => handleSelect(tutor)}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-accent transition-colors",
                  value === tutor.id && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate">{tutor.nombre_completo}</p>
                  <p className="text-xs text-muted-foreground">
                    {tutor.rut}{tutor.telefono ? ` · ${tutor.telefono}` : ""}
                  </p>
                </div>
                {value === tutor.id && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {!loading && results.length > 0 && (
            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreateNew();
                }}
                className="flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear nuevo tutor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}