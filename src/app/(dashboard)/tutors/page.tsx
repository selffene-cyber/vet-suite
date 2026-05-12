"use client";

import { useState, useEffect, useCallback } from "react";
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

const EMPTY_FORM = {
  nombre_completo: "",
  rut: "",
  telefono: "",
  correo: "",
  direccion: "",
  comuna: "",
  region: "",
  observaciones: "",
};

export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tutors, setTutors] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchTutors = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/tutors${params}`);
      if (res.ok) {
        const data = await res.json();
        setTutors(data.tutors || []);
      }
    } catch {}
  }, [search]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  useEffect(() => {
    const timer = setTimeout(fetchTutors, 300);
    return () => clearTimeout(timer);
  }, [search, fetchTutors]);

  const updateField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowDialog(true);
  };

  const handleOpenEdit = (tutor: Record<string, unknown>) => {
    setEditingId(tutor.id as string);
    setForm({
      nombre_completo: (tutor.nombre_completo as string) || "",
      rut: (tutor.rut as string) || "",
      telefono: (tutor.telefono as string) || "",
      correo: (tutor.correo as string) || "",
      direccion: (tutor.direccion as string) || "",
      comuna: (tutor.comuna as string) || "",
      region: (tutor.region as string) || "",
      observaciones: (tutor.observaciones as string) || "",
    });
    setError("");
    setShowDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (!form.nombre_completo || !form.rut || !form.telefono || !form.direccion || !form.region || !form.comuna) {
        throw new Error("Complete todos los campos obligatorios");
      }

      const url = editingId ? `/api/tutors/${editingId}` : "/api/tutors";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { nombre_completo: form.nombre_completo, telefono: form.telefono, correo: form.correo, direccion: form.direccion, comuna: form.comuna, region: form.region, observaciones: form.observaciones }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar tutor");
      }

      setForm({ ...EMPTY_FORM });
      setShowDialog(false);
      setEditingId(null);
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
        <Card key={t.id as string} onClick={() => handleOpenEdit(t)} className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="pt-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{t.nombre_completo as string}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRut(t.rut as string)} · {t.telefono as string}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.comuna as string}, {t.region as string}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0 mt-0.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </CardContent>
        </Card>
      ))}

      <FAB onClick={handleOpenCreate} label="Nuevo tutor" />

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingId ? "Editar Tutor" : "Nuevo Tutor"}>
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
            disabled={!!editingId}
          />
          {editingId && <p className="text-xs text-muted-foreground -mt-2">El RUT no se puede modificar</p>}
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
            {saving ? "Guardando..." : editingId ? "Guardar Cambios" : "Guardar Tutor"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}