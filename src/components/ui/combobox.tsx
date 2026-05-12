"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils";

interface ComboboxOption {
  value: string;
  label?: string;
  group?: string;
}

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Combobox({ label, placeholder, options, value, onChange, disabled, error, className }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) =>
        (o.label || o.value).toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const groups = filtered.reduce<Record<string, ComboboxOption[]>>((acc, o) => {
    const g = o.group || "";
    if (!acc[g]) acc[g] = [];
    acc[g].push(o);
    return acc;
  }, {});

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("w-full", className)} ref={ref}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen(!open); setQuery(""); }}
        className={cn(
          "flex h-12 w-full rounded-md border bg-background px-3 py-2 text-base text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-input",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="flex-1 truncate">
          {selected ? selected.label || selected.value : placeholder || "Seleccionar..."}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 shrink-0 text-muted-foreground">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {open && (
        <div className="relative z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto overscroll-contain p-1">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            )}
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                {group && (
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {group}
                  </p>
                )}
                {items.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      onChange(item.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors",
                      value === item.value && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.label || item.value}
                    {value === item.value && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}