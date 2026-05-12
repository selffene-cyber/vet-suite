"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";

interface PatientOption {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  tutor_nombre: string;
  numero_ficha?: string;
}

interface PatientSearchProps {
  label?: string;
  placeholder?: string;
  value: string;
  patientName?: string;
  onChange: (id: string, patient: PatientOption | null) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function PatientSearch({ label, placeholder, value, patientName, onChange, disabled, error, className }: PatientSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !open) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 340 && rect.top > spaceBelow;
    setDropdownStyle({ position: "fixed", top: showAbove ? rect.top - 340 : rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
  }, [open]);

  useEffect(() => { updatePosition(); }, [updatePosition]);
  useEffect(() => {
    if (!open) return;
    const h = () => updatePosition();
    window.addEventListener("scroll", h, true); window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h, true); window.removeEventListener("resize", h); };
  }, [open, updatePosition]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(t) && dropdownRef.current && !dropdownRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchPatients = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(false);
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(term)}`);
      if (res.ok) { const d = await res.json(); setResults((d.patients || []) as PatientOption[]); }
    } catch { setResults([]); }
    finally { setLoading(false); setSearched(true); }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchPatients(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, open, searchPatients]);

  const clearSelection = () => onChange("", null);

  const dropdownContent = open ? (
    <div ref={dropdownRef} style={dropdownStyle} className="rounded-md border bg-popover shadow-md">
      <div className="p-2 border-b">
        <input type="text" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Buscar por nombre, tutor, RUT..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
      </div>
      <div className="max-h-60 overflow-y-auto overscroll-contain p-1">
        {loading && <div className="flex items-center justify-center py-6"><div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" /><span className="ml-2 text-sm text-muted-foreground">Buscando...</span></div>}
        {!loading && searched && results.length === 0 && query.trim() && <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron pacientes</p>}
        {!loading && !searched && !query.trim() && <p className="py-6 text-center text-sm text-muted-foreground">Escriba para buscar un paciente</p>}
        {!loading && results.map((p) => (
          <button key={p.id} type="button" onClick={() => { onChange(p.id, p); setOpen(false); setQuery(""); }}
            className={cn("flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-accent transition-colors", value === p.id && "bg-accent text-accent-foreground")}>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium truncate">{p.nombre}</p>
              <p className="text-xs text-muted-foreground">{p.especie} · {p.raza} — {p.tutor_nombre}</p>
              {p.numero_ficha && <p className="text-[10px] text-muted-foreground">Ficha: {p.numero_ficha}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className={cn("w-full", className)} ref={triggerRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>}
      {value && patientName ? (
        <div className={cn("flex h-12 w-full items-center rounded-md border bg-background px-3 py-2 text-base", error ? "border-destructive" : "border-input")}>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{patientName}</p></div>
          {!disabled && <button type="button" onClick={clearSelection} className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}
        </div>
      ) : (
        <button type="button" disabled={disabled} onClick={() => { if (disabled) return; setOpen(!open); setQuery(""); setResults([]); setSearched(false); setTimeout(() => updatePosition(), 0); }}
          className={cn("flex h-12 w-full items-center rounded-md border bg-background px-3 py-2 text-base text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", error ? "border-destructive" : "border-input", "text-muted-foreground")}>
          <span className="flex-1 truncate">{placeholder || "Buscar paciente..."}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 shrink-0 text-muted-foreground"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {dropdownContent && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  );
}