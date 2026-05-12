"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { getPrescriptionStatusLabel } from "@/utils";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const statuses = ["emitida", "vigente", "vencida", "anulada", "reemplazada"];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Historial de Recetas</h1>
        <button
          onClick={() => setShowFilters(true)}
          className="h-11 px-3 inline-flex items-center gap-1 rounded-lg border text-sm hover:bg-accent transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por folio, paciente o tutor..."
      />

      <div className="text-sm text-muted-foreground">
        No hay recetas emitidas
      </div>

      <BottomSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtrar Recetas"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Estado</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => {
                const { label, color } = getPrescriptionStatusLabel(s);
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${color} ${
                      statusFilter === s ? "ring-2 ring-offset-1 ring-ring" : ""
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <Input label="Fecha desde" type="date" />
          <Input label="Fecha hasta" type="date" />
          <div>
            <p className="text-sm font-medium mb-2">Tipo de Receta</p>
            <div className="space-y-2">
              {["receta_simple", "receta_retenida", "receta_retenida_control_saldo", "receta_antimicrobiano"].map(
                (t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input type="checkbox" className="h-5 w-5" />
                    <span className="text-sm capitalize">{t.replace(/_/g, " ")}</span>
                  </label>
                )
              )}
            </div>
          </div>
          <Button className="w-full" onClick={() => setShowFilters(false)}>
            Aplicar Filtros
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}