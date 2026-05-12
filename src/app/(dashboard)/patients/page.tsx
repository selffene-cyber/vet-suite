"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { FAB } from "@/components/ui/fab";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { TutorSearch } from "@/components/ui/tutor-search";
import { SPECIES_GROUPS, getBreedsForSpecies } from "@/utils/breeds";
import { patientSchema } from "@/lib/validators/patient";

const SEX = [
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
  { value: "desconocido", label: "Desconocido" },
];

interface TutorInfo {
  id: string;
  nombre_completo: string;
  rut: string;
  telefono: string;
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateTutor, setShowCreateTutor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    tutor_id: "",
    nombre: "",
    especie: "",
    raza: "",
    sexo: "desconocido",
    fecha_nacimiento: "",
    peso: "",
    color: "",
    microchip: "",
    alergias: "",
    condiciones_relevantes: "",
  });
  const [selectedTutor, setSelectedTutor] = useState<TutorInfo | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [tutorForm, setTutorForm] = useState({
    nombre_completo: "",
    rut: "",
    telefono: "",
    correo: "",
    direccion: "",
    comuna: "",
    region: "",
    observaciones: "",
  });

  const fetchPatients = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/patients${params}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch {}
  }, [search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  const breedOptions = useMemo(() => {
    if (!form.especie) return [];
    return getBreedsForSpecies(form.especie);
  }, [form.especie]);

  const sexOptions = useMemo(() => SEX, []);

  const updateField = (field: string, value: string) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "especie") {
        next.raza = "";
      }
      return next;
    });
    setFieldErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const handleTutorSelect = (id: string, tutor: TutorInfo | null) => {
    setForm((f) => ({ ...f, tutor_id: id }));
    setSelectedTutor(tutor);
    setFieldErrors((e) => {
      const next = { ...e };
      delete next.tutor_id;
      return next;
    });
  };

  const handleCreateTutor = () => {
    setShowCreate(false);
    setShowCreateTutor(true);
  };

  const updateTutorField = (field: string, value: string) =>
    setTutorForm((f) => ({ ...f, [field]: value }));

  const handleSaveTutor = async () => {
    setSaving(true);
    setError("");
    try {
      if (!tutorForm.nombre_completo || !tutorForm.rut || !tutorForm.telefono || !tutorForm.direccion || !tutorForm.region || !tutorForm.comuna) {
        throw new Error("Complete todos los campos obligatorios");
      }
      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tutorForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear tutor");
      }
      const data = await res.json();
      const newTutor = data.tutor as Record<string, unknown>;
      handleTutorSelect(newTutor.id as string, {
        id: newTutor.id as string,
        nombre_completo: newTutor.nombre_completo as string,
        rut: newTutor.rut as string,
        telefono: newTutor.telefono as string,
      });
      setTutorForm({ nombre_completo: "", rut: "", telefono: "", correo: "", direccion: "", comuna: "", region: "", observaciones: "" });
      setShowCreateTutor(false);
      setShowCreate(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar tutor");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePatient = async () => {
    setError("");
    setFieldErrors({});

    const payload = {
      ...form,
      peso: form.peso ? parseFloat(form.peso) : undefined,
    };

    const result = patientSchema.safeParse(payload);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear paciente");
      }
      setForm({ tutor_id: "", nombre: "", especie: "", raza: "", sexo: "desconocido", fecha_nacimiento: "", peso: "", color: "", microchip: "", alergias: "", condiciones_relevantes: "" });
      setSelectedTutor(null);
      setFieldErrors({});
      setShowCreate(false);
      fetchPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreate = () => {
    setForm({ tutor_id: "", nombre: "", especie: "", raza: "", sexo: "desconocido", fecha_nacimiento: "", peso: "", color: "", microchip: "", alergias: "", condiciones_relevantes: "" });
    setSelectedTutor(null);
    setFieldErrors({});
    setError("");
    setShowCreate(true);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Pacientes</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o tutor..."
      />

      {patients.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No hay pacientes registrados
        </div>
      )}

      {patients.map((p) => (
        <Card key={p.id as string}>
          <CardContent className="pt-3">
            <p className="font-medium text-sm">{p.nombre as string}</p>
            <p className="text-xs text-muted-foreground">
              {p.especie as string} · {p.raza as string}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tutor: {p.tutor_nombre as string}
            </p>
          </CardContent>
        </Card>
      ))}

      <FAB onClick={handleOpenCreate} label="Nuevo paciente" />

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Paciente">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <TutorSearch
            label="Tutor"
            placeholder="Buscar tutor..."
            value={form.tutor_id}
            tutorName={selectedTutor?.nombre_completo}
            onChange={handleTutorSelect}
            onCreateNew={handleCreateTutor}
            error={fieldErrors.tutor_id}
          />

          <Input
            label="Nombre del paciente"
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Firulais"
            error={fieldErrors.nombre}
          />

          <Combobox
            label="Tipo de Paciente"
            placeholder="Seleccionar tipo..."
            options={SPECIES_GROUPS.map((s) => ({ value: s.value, label: s.label }))}
            value={form.especie}
            onChange={(v) => updateField("especie", v)}
            error={fieldErrors.especie}
          />

          {form.especie && (
            <Combobox
              label="Raza"
              placeholder="Buscar raza..."
              options={breedOptions}
              value={form.raza}
              onChange={(v) => updateField("raza", v)}
              error={fieldErrors.raza}
            />
          )}

          <Combobox
            label="Sexo"
            placeholder="Seleccionar..."
            options={sexOptions}
            value={form.sexo}
            onChange={(v) => updateField("sexo", v)}
          />

          <Input
            label="Fecha de nacimiento"
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
          />

          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            placeholder="5.0"
            value={form.peso}
            onChange={(e) => updateField("peso", e.target.value)}
          />

          <Input
            label="Color"
            placeholder="Dorado"
            value={form.color}
            onChange={(e) => updateField("color", e.target.value)}
          />

          <Input
            label="Microchip (opcional)"
            placeholder="Opcional"
            value={form.microchip}
            onChange={(e) => updateField("microchip", e.target.value)}
          />

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

          <Textarea
            label="Alergias"
            placeholder="Opcional"
            rows={2}
            value={form.alergias}
            onChange={(e) => updateField("alergias", e.target.value)}
          />

          <Textarea
            label="Condiciones relevantes"
            placeholder="Opcional"
            rows={2}
            value={form.condiciones_relevantes}
            onChange={(e) => updateField("condiciones_relevantes", e.target.value)}
          />

          <Button className="w-full" onClick={handleSavePatient} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Paciente"}
          </Button>
        </div>
      </Dialog>

      <Dialog open={showCreateTutor} onClose={() => { setShowCreateTutor(false); setShowCreate(true); }} title="Nuevo Tutor">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Input
            label="Nombre completo"
            value={tutorForm.nombre_completo}
            onChange={(e) => updateTutorField("nombre_completo", e.target.value)}
            placeholder="María González"
          />
          <Input
            label="RUT"
            value={tutorForm.rut}
            onChange={(e) => updateTutorField("rut", e.target.value)}
            placeholder="12.345.678-9"
          />
          <Input
            label="Teléfono"
            type="tel"
            value={tutorForm.telefono}
            onChange={(e) => updateTutorField("telefono", e.target.value)}
            placeholder="+56 9 1234 5678"
          />
          <Input
            label="Correo (opcional)"
            type="email"
            value={tutorForm.correo}
            onChange={(e) => updateTutorField("correo", e.target.value)}
            placeholder="correo@ejemplo.cl"
          />
          <Input
            label="Dirección"
            value={tutorForm.direccion}
            onChange={(e) => updateTutorField("direccion", e.target.value)}
            placeholder="Av. Principal 123"
          />
          <Button className="w-full" onClick={handleSaveTutor} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Tutor"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}