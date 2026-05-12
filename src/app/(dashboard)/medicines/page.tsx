"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { getSaleConditionLabel } from "@/utils";

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const conditions = [
    "venta_libre",
    "receta_simple",
    "receta_retenida",
    "receta_retenida_control_saldo",
    "uso_restringido",
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Medicamentos</h1>
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
        placeholder="Buscar medicamento o principio activo..."
      />

      <div className="text-sm text-muted-foreground">
        No hay medicamentos en el catálogo
      </div>

      <BottomSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtrar Medicamentos"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Condición de Venta</p>
            <div className="space-y-2">
              {conditions.map((c) => (
                <label key={c} className="flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5" />
                  <span className="text-sm">{getSaleConditionLabel(c)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" />
              <span className="text-sm font-medium">Solo antimicrobianos</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" />
              <span className="text-sm font-medium">Control especial</span>
            </label>
          </div>
          <Button
            className="w-full"
            onClick={() => setShowFilters(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}