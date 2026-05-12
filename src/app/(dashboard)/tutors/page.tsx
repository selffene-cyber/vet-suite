"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { FAB } from "@/components/ui/fab";
import { Card, CardContent } from "@/components/ui/card";
import { REGIONS, COMMUNES } from "@/utils/regions";
import { formatRut } from "@/utils/helpers";

export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tutors, setTutors] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({
    nombre_completo: "",
    rut: "",
    telefono: "",
    correo: "",
    direccion: "",
    comuna: "",
    region: "",
    observaciones: "",
  });

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/tutors${params}`);
      if (res.ok) {
        const data = await res.json();
        setTutors(data.tutors || []);
      }
    } catch {}
  };

  useEffect(() => {
    const timer = setTimeout(fetchTutors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const updateField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (!form.nombre_completo || !form.rut || !form.telefono || !form.direccion || !form.region || !form.comuna) {
        throw new Error("Complete todos los campos obligatorios");
      }

      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear tutor");
      }

      setForm({ nombre_completo: "", rut: "", telefono: "", correo: "", direccion: "", comuna: "", region: "", observaciones: "" });
      setShowCreate(false);
      fetchTutors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const communeOptions = form.region
    ? (COMMUNES[form.region] || []).map((c) => ({ value: c, label: c }))
    : [];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Tutores</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o RUT..."
      />

      {tutors.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No hay tutores registrados
        </div>
      )}

      {tutors.map((t) => (
        <Card key={t.id as string}>
          <CardContent className="pt-3">
            <p className="font-medium text-sm">{t.nombre_completo as string}</p>
            <p className="text-xs text-muted-foreground">
              {formatRut(t.rut as string)} · {t.telefono as string}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.comuna as string}, {t.region as string}
            </p>
          </CardContent>
        </Card>
      ))}

      <FAB onClick={() => setShowCreate(true)} label="Nuevo tutor" />

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Tutor">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Input
            label="Nombre completo"
            value={form.nombre_completo}
            onChange={(e) => updateField("nombre_completo", e.target.value)}
            placeholder="María González"
          />
          <Input
            label="RUT"
            value={form.rut}
            onChange={(e) => updateField("rut", e.target.value)}
            placeholder="12.345.678-9"
          />
          <Input
            label="Teléfono"
            type="tel"
            value={form.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            placeholder="+56 9 1234 5678"
          />
          <Input
            label="Correo (opcional)"
            type="email"
            value={form.correo}
            onChange={(e) => updateField("correo", e.target.value)}
            placeholder="correo@ejemplo.cl"
          />
          <Input
            label="Dirección"
            value={form.direccion}
            onChange={(e) => updateField("direccion", e.target.value)}
            placeholder="Av. Principal 123"
          />
          <Select
            label="Región"
            value={form.region}
            onChange={(e) => {
              updateField("region", e.target.value);
              updateField("comuna", "");
            }}
            options={REGIONS}
            placeholder="Seleccionar región"
          />
          <Select
            label="Comuna"
            value={form.comuna}
            onChange={(e) => updateField("comuna", e.target.value)}
            options={communeOptions}
            placeholder={form.region ? "Seleccionar comuna" : "Primero seleccione región"}
            disabled={!form.region}
          />
          <Textarea
            label="Observaciones"
            value={form.observaciones}
            onChange={(e) => updateField("observaciones", e.target.value)}
            placeholder="Opcional"
            rows={2}
          />
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Tutor"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}