"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { FAB } from "@/components/ui/fab";
import { formatRut } from "@/utils";

const REGIONS = [
  { value: "rm", label: "Metropolitana" },
  { value: "valparaiso", label: "Valparaíso" },
  { value: "biobio", label: "Biobío" },
];

export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Tutores</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o RUT..."
      />

      <div className="text-sm text-muted-foreground">
        No hay tutores registrados
      </div>

      <FAB onClick={() => setShowCreate(true)} label="Nuevo tutor" />

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo Tutor"
      >
        <div className="space-y-4">
          <Input label="Nombre completo" placeholder="María González" />
          <Input label="RUT" placeholder="12.345.678-9" />
          <Input label="Teléfono" type="tel" placeholder="+56 9 1234 5678" />
          <Input label="Correo" type="email" placeholder="correo@ejemplo.cl" />
          <Input label="Dirección" placeholder="Av. Principal 123" />
          <Input label="Comuna" placeholder="Santiago" />
          <Select
            label="Región"
            options={REGIONS}
            placeholder="Seleccionar región"
          />
          <Textarea label="Observaciones" placeholder="Opcional" rows={2} />
          <Button className="w-full">Guardar Tutor</Button>
        </div>
      </Dialog>
    </div>
  );
}