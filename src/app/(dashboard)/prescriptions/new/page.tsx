"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import {
  getSaleConditionLabel,
  getPrescriptionTypeBadgeColor,
} from "@/utils";

const STEPS = [
  { label: "Paciente" },
  { label: "Tutor" },
  { label: "Médico" },
  { label: "Diagnóstico" },
  { label: "Medicamentos" },
  { label: "Revisar" },
];

const PRESCRIPTION_TYPES = [
  { value: "receta_simple", label: "Receta Simple" },
  { value: "receta_retenida", label: "Receta Retenida" },
  { value: "receta_retenida_control_saldo", label: "Receta Retenida c/Control Saldo" },
  { value: "receta_antimicrobiano", label: "Receta Antimicrobiano" },
];

const VIA_ADMIN = [
  { value: "oral", label: "Oral" },
  { value: "subcutanea", label: "Subcutánea" },
  { value: "intramuscular", label: "Intramuscular" },
  { value: "intravenosa", label: "Intravenosa" },
  { value: "topica", label: "Tópica" },
  { value: "oftalmica", label: "Oftálmica" },
  { value: "otica", label: "Ótica" },
  { value: "rectal", label: "Rectal" },
  { value: "inhalatoria", label: "Inhalatoria" },
];

export default function NewPrescriptionPage() {
  const [step, setStep] = useState(0);
  const [patientSearch, setPatientSearch] = useState("");
  const [medSearch, setMedSearch] = useState("");
  const [showAddMed, setShowAddMed] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    tutorId: "",
    tutorName: "",
    tutorRut: "",
    tutorPhone: "",
    vetId: "",
    vetName: "",
    diagnostico: "",
    tipoReceta: "receta_simple",
    observaciones: "",
    items: [] as Array<{
      medicineId: string;
      nombre: string;
      principio: string;
      dosis: string;
      frecuencia: string;
      duracion: string;
      via: string;
      cantidad: number;
      indicaciones: string;
      advertencias: string;
      condicion: string;
      antimicrobiano: boolean;
    }>,
  });

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.patientId;
      case 1: return !!form.tutorId;
      case 2: return !!form.vetId;
      case 3: return !!form.diagnostico;
      case 4: return form.items.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Nueva Receta</h1>

      <Stepper steps={STEPS} currentStep={step} />

      <Card>
        <CardContent className="pt-4 space-y-4">
          {step === 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                Selecciona el paciente para la receta
              </p>
              <SearchBar
                value={patientSearch}
                onChange={setPatientSearch}
                placeholder="Buscar paciente por nombre..."
              />
              <div className="text-sm text-muted-foreground">
                No hay pacientes con ese nombre
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                Confirma los datos del tutor
              </p>
              <Input label="Nombre" value={form.tutorName} readOnly />
              <Input label="RUT" value={form.tutorRut} readOnly />
              <Input label="Teléfono" value={form.tutorPhone} readOnly />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Selecciona el médico veterinario emisor
              </p>
              <div className="text-sm text-muted-foreground">
                No hay médicos disponibles
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Select
                label="Tipo de Receta"
                value={form.tipoReceta}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tipoReceta: e.target.value }))
                }
                options={PRESCRIPTION_TYPES}
              />
              <Textarea
                label="Diagnóstico / Motivo de prescripción"
                value={form.diagnostico}
                onChange={(e) =>
                  setForm((f) => ({ ...f, diagnostico: e.target.value }))
                }
                placeholder="Describa el diagnóstico o motivo..."
                rows={3}
              />
              <Textarea
                label="Observaciones clínicas (opcional)"
                value={form.observaciones}
                onChange={(e) =>
                  setForm((f) => ({ ...f, observaciones: e.target.value }))
                }
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sm text-muted-foreground">
                Agrega los medicamentos a prescribir
              </p>
              {form.items.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay medicamentos agregados
                  </p>
                </div>
              )}
              {form.items.map((item, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="pt-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.principio}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            items: f.items.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="h-8 w-8 inline-flex items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge
                        className={getPrescriptionTypeBadgeColor(item.condicion)}
                      >
                        {getSaleConditionLabel(item.condicion)}
                      </Badge>
                      {item.antimicrobiano && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Antimicrobiano
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-xs">
                      {item.dosis} | {item.frecuencia} | {item.duracion} | {item.via}
                    </p>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddMed(true)}
              >
                + Agregar Medicamento
              </Button>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-sm font-medium">Resumen de Receta</p>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Paciente</p>
                  <p className="text-sm font-medium">
                    {form.patientName || "Sin seleccionar"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Tutor</p>
                  <p className="text-sm font-medium">
                    {form.tutorName || "Sin seleccionar"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Médico</p>
                  <p className="text-sm font-medium">
                    {form.vetName || "Sin seleccionar"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <Badge
                    className={getPrescriptionTypeBadgeColor(form.tipoReceta)}
                  >
                    {PRESCRIPTION_TYPES.find((t) => t.value === form.tipoReceta)?.label}
                  </Badge>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Diagnóstico</p>
                  <p className="text-sm">{form.diagnostico}</p>
                </div>
                {form.items.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Medicamentos ({form.items.length})
                    </p>
                    {form.items.map((item, i) => (
                      <div key={i} className="text-sm py-1 border-b last:border-0">
                        {item.nombre} — {item.dosis}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            disabled={!canProceed()}
          >
            Siguiente
          </Button>
        ) : (
          <Button className="flex-1">
            Emitir Receta y Generar PDF
          </Button>
        )}
      </div>

      <Dialog
        open={showAddMed}
        onClose={() => setShowAddMed(false)}
        title="Agregar Medicamento"
      >
        <div className="space-y-4">
          <SearchBar
            value={medSearch}
            onChange={setMedSearch}
            placeholder="Buscar medicamento..."
          />
          <Input label="Dosis" placeholder="5 mg/kg" />
          <Input label="Frecuencia" placeholder="Cada 12 horas" />
          <Input label="Duración" placeholder="7 días" />
          <Select label="Vía de administración" options={VIA_ADMIN} placeholder="Seleccionar" />
          <Input label="Cantidad" type="number" placeholder="1" />
          <Textarea label="Indicaciones" placeholder="Indicaciones para el tutor..." rows={2} />
          <Textarea label="Advertencias" placeholder="Opcional" rows={2} />
          <Button className="w-full">Agregar</Button>
        </div>
      </Dialog>
    </div>
  );
}