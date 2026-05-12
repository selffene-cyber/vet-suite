"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { REGIONS, COMMUNES } from "@/utils/regions";

const STEPS = [
  { label: "Datos" },
  { label: "Dirección" },
  { label: "Configuración" },
  { label: "Branding" },
];

export default function CompanyPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [timbreFile, setTimbreFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    raz_social: "",
    nombre_fantasia: "",
    rut: "",
    telefono: "",
    correo_contacto: "",
    sitio_web: "",
    direccion: "",
    comuna: "",
    region: "",
    nro_autorizacion_sanitaria: "",
    folio_inicial: 1,
    prefijo_folio: "REC-",
    dias_vigencia_simple: 30,
    dias_vigencia_retenida: 30,
    dias_vigencia_control: 90,
    correo_remitente: "",
    firma_config: "imagen",
    texto_legal_pie: "",
    logo_url: "",
    timbre_url: "",
  });

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((data) => {
        if (data.company) {
          const c = data.company as Record<string, unknown>;
          const s = (data.settings as Record<string, unknown>) || {};
          setForm((f) => ({
            ...f,
            raz_social: (c.raz_social as string) || "",
            nombre_fantasia: (c.nombre_fantasia as string) || "",
            rut: (c.rut as string) || "",
            telefono: (c.telefono as string) || "",
            correo_contacto: (c.correo_contacto as string) || "",
            sitio_web: (c.sitio_web as string) || "",
            direccion: (c.direccion as string) || "",
            comuna: (c.comuna as string) || "",
            region: (c.region as string) || "",
            nro_autorizacion_sanitaria: (c.nro_autorizacion_sanitaria as string) || "",
            logo_url: (c.logo_url as string) || "",
            timbre_url: (c.timbre_url as string) || "",
            texto_legal_pie: (c.texto_legal_pie as string) || "",
            folio_inicial: (s.folio_inicial as number) || 1,
            prefijo_folio: (s.prefijo_folio as string) || "REC-",
            dias_vigencia_simple: (s.dias_vigencia_receta_simple as number) || 30,
            dias_vigencia_retenida: (s.dias_vigencia_receta_retenida as number) || 30,
            dias_vigencia_control: (s.dias_vigencia_receta_control_saldo as number) || 90,
            correo_remitente: (s.correo_remitente as string) || "",
            firma_config: (s.firma_config as string) || "imagen",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const updateField = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);
    formData.append("companyId", "company-demo-001");
    const res = await fetch("/api/storage/uploads/company/company-demo-001", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      let logoUrl = form.logo_url;
      let timbreUrl = form.timbre_url;

      if (logoFile) {
        const url = await uploadFile(logoFile, "logos");
        if (url) logoUrl = url;
      }
      if (timbreFile) {
        const url = await uploadFile(timbreFile, "timbres");
        if (url) timbreUrl = url;
      }

      const payload = {
        companyId: "company-demo-001",
        raz_social: form.raz_social,
        nombre_fantasia: form.nombre_fantasia,
        rut: form.rut,
        telefono: form.telefono,
        correo_contacto: form.correo_contacto,
        sitio_web: form.sitio_web || null,
        direccion: form.direccion,
        comuna: form.comuna,
        region: form.region,
        nro_autorizacion_sanitaria: form.nro_autorizacion_sanitaria || null,
        logo_url: logoUrl || null,
        timbre_url: timbreUrl || null,
        texto_legal_pie: form.texto_legal_pie || null,
        folio_inicial: form.folio_inicial,
        prefijo_folio: form.prefijo_folio,
        dias_vigencia_receta_simple: form.dias_vigencia_simple,
        dias_vigencia_receta_retenida: form.dias_vigencia_retenida,
        dias_vigencia_receta_control_saldo: form.dias_vigencia_control,
        correo_remitente: form.correo_remitente,
        firma_config: form.firma_config,
      };

      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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
      <h1 className="text-xl font-bold">Configuración de Empresa</h1>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-sm text-green-700 dark:text-green-300">
          Configuración guardada correctamente
        </div>
      )}

      <Stepper steps={STEPS} currentStep={step} />

      <Card>
        <CardContent className="pt-4 space-y-4">
          {step === 0 && (
            <>
              <Input
                label="Razón Social"
                value={form.raz_social}
                onChange={(e) => updateField("raz_social", e.target.value)}
              />
              <Input
                label="Nombre de Fantasía"
                value={form.nombre_fantasia}
                onChange={(e) => updateField("nombre_fantasia", e.target.value)}
              />
              <Input
                label="RUT Empresa"
                value={form.rut}
                onChange={(e) => updateField("rut", e.target.value)}
                placeholder="12.345.678-9"
              />
              <Input
                label="Teléfono"
                type="tel"
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
              />
              <Input
                label="Correo de Contacto"
                type="email"
                value={form.correo_contacto}
                onChange={(e) => updateField("correo_contacto", e.target.value)}
              />
              <Input
                label="Sitio Web (opcional)"
                type="url"
                value={form.sitio_web}
                onChange={(e) => updateField("sitio_web", e.target.value)}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Input
                label="Dirección"
                value={form.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
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
              <Input
                label="N° Autorización Sanitaria (opcional)"
                value={form.nro_autorizacion_sanitaria}
                onChange={(e) =>
                  updateField("nro_autorizacion_sanitaria", e.target.value)
                }
              />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="Prefijo de Folio"
                value={form.prefijo_folio}
                onChange={(e) => updateField("prefijo_folio", e.target.value)}
              />
              <Input
                label="Folio Inicial"
                type="number"
                value={String(form.folio_inicial)}
                onChange={(e) =>
                  updateField("folio_inicial", parseInt(e.target.value) || 1)
                }
              />
              <Input
                label="Días vigencia receta simple"
                type="number"
                value={String(form.dias_vigencia_simple)}
                onChange={(e) =>
                  updateField("dias_vigencia_simple", parseInt(e.target.value) || 30)
                }
              />
              <Input
                label="Días vigencia receta retenida"
                type="number"
                value={String(form.dias_vigencia_retenida)}
                onChange={(e) =>
                  updateField("dias_vigencia_retenida", parseInt(e.target.value) || 30)
                }
              />
              <Input
                label="Días vigencia receta c/control saldo"
                type="number"
                value={String(form.dias_vigencia_control)}
                onChange={(e) =>
                  updateField("dias_vigencia_control", parseInt(e.target.value) || 90)
                }
              />
              <Input
                label="Correo remitente notificaciones"
                type="email"
                value={form.correo_remitente}
                onChange={(e) => updateField("correo_remitente", e.target.value)}
              />
              <Select
                label="Tipo de firma"
                value={form.firma_config}
                onChange={(e) => updateField("firma_config", e.target.value)}
                options={[
                  { value: "imagen", label: "Imagen de firma" },
                  { value: "firma_electronica", label: "Firma electrónica avanzada (preparado)" },
                ]}
              />
            </>
          )}

          {step === 3 && (
            <>
              <ImageUpload
                label="Logo de la Clínica"
                value={form.logo_url}
                onChange={(file) => setLogoFile(file)}
                preview={form.logo_url ? form.logo_url : undefined}
              />
              <ImageUpload
                label="Timbre / Sello"
                value={form.timbre_url}
                onChange={(file) => setTimbreFile(file)}
                preview={form.timbre_url ? form.timbre_url : undefined}
              />
              <Textarea
                label="Texto legal pie de página"
                value={form.texto_legal_pie}
                onChange={(e) => updateField("texto_legal_pie", e.target.value)}
                placeholder="Documento emitido conforme al Decreto N°25/2005..."
                rows={3}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {step > 0 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(step - 1)}
          >
            Anterior
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            className="flex-1"
            onClick={() => setStep(step + 1)}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        )}
      </div>
    </div>
  );
}