"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  { label: "Datos" },
  { label: "Dirección" },
  { label: "Configuración" },
  { label: "Branding" },
];

const REGIONS = [
  { value: "tarapaca", label: "Tarapacá" },
  { value: "antofagasta", label: "Antofagasta" },
  { value: "atacama", label: "Atacama" },
  { value: "coquimbo", label: "Coquimbo" },
  { value: "valparaiso", label: "Valparaíso" },
  { value: "ohiggins", label: "O'Higgins" },
  { value: "maule", label: "Maule" },
  { value: "biobio", label: "Biobío" },
  { value: "araucania", label: "Araucanía" },
  { value: "los_lagos", label: "Los Lagos" },
  { value: "aysen", label: "Aysén" },
  { value: "magallanes", label: "Magallanes" },
  { value: "rm", label: "Metropolitana" },
  { value: "los_rios", label: "Los Ríos" },
  { value: "arica", label: "Arica y Parinacota" },
  { value: "nuble", label: "Ñuble" },
];

export default function CompanyPage() {
  const [step, setStep] = useState(0);
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
  });

  const updateField = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Configuración de Empresa</h1>

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
              <Input
                label="Comuna"
                value={form.comuna}
                onChange={(e) => updateField("comuna", e.target.value)}
              />
              <Select
                label="Región"
                value={form.region}
                onChange={(e) => updateField("region", e.target.value)}
                options={REGIONS}
                placeholder="Seleccionar región"
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
                  updateField(
                    "dias_vigencia_simple",
                    parseInt(e.target.value) || 30
                  )
                }
              />
              <Input
                label="Días vigencia receta retenida"
                type="number"
                value={String(form.dias_vigencia_retenida)}
                onChange={(e) =>
                  updateField(
                    "dias_vigencia_retenida",
                    parseInt(e.target.value) || 30
                  )
                }
              />
              <Input
                label="Días vigencia receta c/control saldo"
                type="number"
                value={String(form.dias_vigencia_control)}
                onChange={(e) =>
                  updateField(
                    "dias_vigencia_control",
                    parseInt(e.target.value) || 90
                  )
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
                  {
                    value: "firma_electronica",
                    label: "Firma electrónica avanzada (preparado)",
                  },
                ]}
              />
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Logo de la Clínica
                </label>
                <div className="flex items-center gap-3">
                  <button className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-accent transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                  <div className="text-xs text-muted-foreground">
                    <p>Toca para cargar desde</p>
                    <p>cámara o galería</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Timbre / Sello
                </label>
                <button className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-accent transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </button>
              </div>
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
          <Button className="flex-1">Guardar Configuración</Button>
        )}
      </div>
    </div>
  );
}