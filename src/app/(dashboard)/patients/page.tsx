"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { FAB } from "@/components/ui/fab";
import { Badge } from "@/components/ui/badge";

const SPECIES = [
  { value: "canino", label: "Canino" },
  { value: "felino", label: "Felino" },
  { value: "ave", label: "Ave" },
  { value: "roedor", label: "Roedor" },
  { value: "reptil", label: "Reptil" },
  { value: "equino", label: "Equino" },
  { value: "bovino", label: "Bovino" },
  { value: "otro", label: "Otro" },
];

const SEX = [
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
  { value: "desconocido", label: "Desconocido" },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Pacientes</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o tutor..."
      />

      <div className="text-sm text-muted-foreground">
        No hay pacientes registrados
      </div>

      <FAB onClick={() => setShowCreate(true)} label="Nuevo paciente" />

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo Paciente"
      >
        <div className="space-y-4">
          <Input label="Tutor" placeholder="Buscar tutor..." />
          <Input label="Nombre del paciente" placeholder="Firulais" />
          <Select
            label="Especie"
            options={SPECIES}
            placeholder="Seleccionar especie"
          />
          <Input label="Raza" placeholder="Labrador" />
          <Select label="Sexo" options={SEX} placeholder="Seleccionar" />
          <Input label="Fecha de nacimiento" type="date" />
          <Input label="Peso (kg)" type="number" step="0.1" placeholder="5.0" />
          <Input label="Color" placeholder="Dorado" />
          <Input label="Microchip (opcional)" placeholder="Opcional" />
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Foto del paciente
            </label>
            <button className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-accent transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
          </div>
          <Textarea label="Alergias" placeholder="Opcional" rows={2} />
          <Textarea
            label="Condiciones relevantes"
            placeholder="Opcional"
            rows={2}
          />
          <Button className="w-full">Guardar Paciente</Button>
        </div>
      </Dialog>
    </div>
  );
}