"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { FAB } from "@/components/ui/fab";

export default function VeterinariansPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Médicos Veterinarios</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o RUT..."
      />

      <div className="text-sm text-muted-foreground">
        No hay médicos veterinarios registrados
      </div>

      <FAB onClick={() => setShowCreate(true)} label="Nuevo médico" />

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo Médico Veterinario"
      >
        <div className="space-y-4">
          <Input label="Nombre completo" placeholder="Dr. Juan Pérez" />
          <Input label="RUT" placeholder="12.345.678-9" />
          <Input
            label="N° Registro Profesional"
            placeholder="12345"
          />
          <Input label="Especialidad" placeholder="Cirugía" />
          <Input label="Correo" type="email" placeholder="dr@clinica.cl" />
          <Input label="Teléfono" type="tel" placeholder="+56 9 1234 5678" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="independiente" className="h-5 w-5" />
            <label htmlFor="independiente" className="text-sm">
              Médico independiente (propietario de clínica)
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Firma (imagen)
            </label>
            <button className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-accent transition-colors">
              <span className="text-xs">Toca para cargar firma desde cámara o galería</span>
            </button>
          </div>
          <Button className="w-full">Guardar Médico</Button>
        </div>
      </Dialog>
    </div>
  );
}