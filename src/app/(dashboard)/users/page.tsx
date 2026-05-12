"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { FAB } from "@/components/ui/fab";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "veterinarian", label: "Médico Veterinario" },
  { value: "assistant", label: "Asistente" },
  { value: "read_only", label: "Solo Lectura" },
  { value: "auditor", label: "Auditor" },
];

const ROLE_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  admin: { variant: "default", label: "Admin" },
  veterinarian: { variant: "secondary", label: "MV" },
  assistant: { variant: "outline", label: "Asist." },
  read_only: { variant: "outline", label: "Lectura" },
  auditor: { variant: "secondary", label: "Auditor" },
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Usuarios</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o correo..."
      />

      <div className="text-sm text-muted-foreground">
        No hay usuarios registrados
      </div>

      <FAB onClick={() => setShowInvite(true)} label="Invitar usuario" />

      <Dialog
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invitar Usuario"
      >
        <div className="space-y-4">
          <Input label="Nombre completo" placeholder="Dr. Juan Pérez" />
          <Input label="Correo electrónico" type="email" placeholder="correo@clinica.cl" />
          <Input label="Teléfono" type="tel" placeholder="+56 9 1234 5678" />
          <Input label="Cargo" placeholder="Veterinario" />
          <Select
            label="Rol"
            options={ROLE_OPTIONS}
            placeholder="Seleccionar rol"
          />
          <Button className="w-full">Enviar Invitación</Button>
        </div>
      </Dialog>
    </div>
  );
}