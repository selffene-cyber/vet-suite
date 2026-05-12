"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import Link from "next/link";

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  registro: { icon: "📋", color: "bg-blue-100 text-blue-800" },
  consulta: { icon: "🩺", color: "bg-green-100 text-green-800" },
  receta: { icon: "💊", color: "bg-purple-100 text-purple-800" },
  examen: { icon: "🔬", color: "bg-amber-100 text-amber-800" },
  control: { icon: "📅", color: "bg-cyan-100 text-cyan-800" },
  vacunacion: { icon: "💉", color: "bg-teal-100 text-teal-800" },
  hospitalizacion: { icon: "🏥", color: "bg-red-100 text-red-800" },
};

const APPOINTMENT_TYPES = [
  { value: "control", label: "Control" },
  { value: "vacunacion", label: "Vacunación" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "otro", label: "Otro" },
];

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<Record<string, unknown> | null>(null);
  const [timeline, setTimeline] = useState<Record<string, unknown>[]>([]);
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "controles" | "examenes">("timeline");

  const [showConsultation, setShowConsultation] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [consultForm, setConsultForm] = useState({ fecha: "", motivo: "", anamnesis: "", examen_fisico: "", diagnostico: "", tratamiento: "", observaciones: "" });
  const [examForm, setExamForm] = useState({ tipo_examen: "", fecha: "", resultados: "", observaciones: "" });
  const [appointmentForm, setAppointmentForm] = useState({ fecha: "", motivo: "", tipo: "control", observaciones: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, mrRes, tlRes, apRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/medical-records?patient_id=${id}`),
        fetch(`/api/clinical-timeline?patient_id=${id}`),
        fetch(`/api/appointments?patient_id=${id}`),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setPatient(d.patient); }
      if (mrRes.ok) { const d = await mrRes.json(); setMedicalRecord(d.medical_record); }
      if (tlRes.ok) { const d = await tlRes.json(); setTimeline(d.timeline || []); }
      if (apRes.ok) { const d = await apRes.json(); setAppointments(d.appointments || []); }
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveConsultation = async () => {
    if (!consultForm.motivo || !consultForm.fecha) { setFormError("Motivo y fecha son obligatorios"); return; }
    setSaving(true); setFormError("");
    try {
      const res = await fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...consultForm, patient_id: id, medical_record_id: medicalRecord?.id || null }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setConsultForm({ fecha: "", motivo: "", anamnesis: "", examen_fisico: "", diagnostico: "", tratamiento: "", observaciones: "" });
      setShowConsultation(false); fetchData();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleSaveExam = async () => {
    if (!examForm.tipo_examen || !examForm.fecha) { setFormError("Tipo y fecha son obligatorios"); return; }
    setSaving(true); setFormError("");
    try {
      const res = await fetch("/api/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...examForm, patient_id: id, medical_record_id: medicalRecord?.id || null }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setExamForm({ tipo_examen: "", fecha: "", resultados: "", observaciones: "" });
      setShowExam(false); fetchData();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleSaveAppointment = async () => {
    if (!appointmentForm.motivo || !appointmentForm.fecha) { setFormError("Motivo y fecha son obligatorios"); return; }
    setSaving(true); setFormError("");
    try {
      const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...appointmentForm, patient_id: id, medical_record_id: medicalRecord?.id || null }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setAppointmentForm({ fecha: "", motivo: "", tipo: "control", observaciones: "" });
      setShowAppointment(false); fetchData();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Cargando ficha...</div>;
  if (!patient) return <div className="p-4 text-sm text-muted-foreground">Paciente no encontrado</div>;

  const especie = String(patient.especie || "");
  const raza = String(patient.raza || "");
  const nombre = String(patient.nombre || "");
  const peso = patient.peso as number | null;
  const fichaNum = String(medicalRecord?.numero_ficha || "—");
  const alergias = String(patient.alergias || "");
  const sexo = String(patient.sexo || "");
  const color = String(patient.color || "");
  const microchip = String(patient.microchip || "");
  const condiciones = String(medicalRecord?.condiciones_preexistentes || "");

  return (
    <div className="p-4 space-y-4">
      <Link href="/patients" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><polyline points="15 18 9 12 15 6" /></svg>
        Volver a pacientes
      </Link>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{nombre}</h1>
              <p className="text-sm text-muted-foreground">{especie} · {raza}</p>
              <p className="text-xs text-muted-foreground mt-1">Ficha: {fichaNum}</p>
              {alergias && <Badge className="mt-2 bg-red-100 text-red-800">Alergias: {alergias}</Badge>}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Sexo: {sexo}</p>
              <p>Peso: {peso ? `${peso} kg` : "—"}</p>
              <p>Color: {color || "—"}</p>
              {microchip && <p>Chip: {microchip}</p>}
            </div>
          </div>
          {condiciones && (
            <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Condiciones preexistentes</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{condiciones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { setFormError(""); setShowConsultation(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          Consulta
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setFormError(""); setShowExam(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          Examen
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setFormError(""); setShowAppointment(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Control
        </Button>
        <Link href={`/prescriptions/new?patient_id=${id}`} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M9 15h6M12 12v6" /></svg>
          Receta
        </Link>
      </div>

      <div className="flex border-b">
        {(["timeline", "controles", "examenes"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab === "timeline" ? "Timeline" : tab === "controles" ? "Controles" : "Exámenes"}
          </button>
        ))}
      </div>

      {activeTab === "timeline" && (
        <div className="space-y-3">
          {timeline.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Sin eventos clínicos</p>}
          {timeline.map((ev) => {
            const cfg = EVENT_ICONS[(ev.event_type as string) || "registro"] || EVENT_ICONS.registro;
            return (
              <Card key={ev.id as string}>
                <CardContent className="pt-3 flex gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-lg shrink-0 bg-muted">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{ev.title as string}</p>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{ev.event_date as string}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{String(ev.description || "")}</p>
                    <Badge className={`mt-1 text-[10px] ${cfg.color}`}>{(ev.event_type as string).replace(/_/g, ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "controles" && (
        <div className="space-y-3">
          {appointments.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Sin controles agendados</p>}
          {appointments.map((ap) => (
            <Card key={ap.id as string}>
              <CardContent className="pt-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{ap.motivo as string}</p>
                  <p className="text-xs text-muted-foreground">{String(ap.fecha || "")} · {String(ap.tipo || "").replace(/_/g, " ")}</p>
                  {String(ap.observaciones || "") !== "" && <p className="text-xs text-muted-foreground mt-1">{String(ap.observaciones)}</p>}
                </div>
                <Badge className={(ap.estado as string) === "pendiente" ? "bg-amber-100 text-amber-800" : (ap.estado as string) === "realizado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {(ap.estado as string).charAt(0).toUpperCase() + (ap.estado as string).slice(1)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "examenes" && (
        <div className="space-y-3">
          {timeline.filter((ev) => ev.event_type === "examen").length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Sin exámenes registrados</p>}
          {timeline.filter((ev) => ev.event_type === "examen").map((ev) => (
            <Card key={ev.id as string}>
              <CardContent className="pt-3">
                <p className="text-sm font-medium">{String(ev.title || "")}</p>
                <p className="text-xs text-muted-foreground">{String(ev.event_date || "")}</p>
                {String(ev.description || "") !== "" && <p className="text-xs text-muted-foreground mt-1">{String(ev.description)}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showConsultation} onClose={() => setShowConsultation(false)} title="Nueva Consulta">
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
          <Input label="Fecha" type="date" value={consultForm.fecha} onChange={(e) => setConsultForm((f) => ({ ...f, fecha: e.target.value }))} />
          <Input label="Motivo" value={consultForm.motivo} onChange={(e) => setConsultForm((f) => ({ ...f, motivo: e.target.value }))} placeholder="Consulta general..." />
          <Textarea label="Anamnesis" value={consultForm.anamnesis} onChange={(e) => setConsultForm((f) => ({ ...f, anamnesis: e.target.value }))} placeholder="Antecedentes..." rows={2} />
          <Textarea label="Examen físico" value={consultForm.examen_fisico} onChange={(e) => setConsultForm((f) => ({ ...f, examen_fisico: e.target.value }))} placeholder="Hallazgos..." rows={2} />
          <Textarea label="Diagnóstico" value={consultForm.diagnostico} onChange={(e) => setConsultForm((f) => ({ ...f, diagnostico: e.target.value }))} placeholder="Diagnóstico..." rows={2} />
          <Textarea label="Tratamiento" value={consultForm.tratamiento} onChange={(e) => setConsultForm((f) => ({ ...f, tratamiento: e.target.value }))} placeholder="Tratamiento indicado..." rows={2} />
          <Button className="w-full" onClick={handleSaveConsultation} disabled={saving}>{saving ? "Guardando..." : "Guardar Consulta"}</Button>
        </div>
      </Dialog>

      <Dialog open={showExam} onClose={() => setShowExam(false)} title="Nuevo Examen">
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
          <Input label="Tipo de examen" value={examForm.tipo_examen} onChange={(e) => setExamForm((f) => ({ ...f, tipo_examen: e.target.value }))} placeholder="Hemograma, Radiografía..." />
          <Input label="Fecha" type="date" value={examForm.fecha} onChange={(e) => setExamForm((f) => ({ ...f, fecha: e.target.value }))} />
          <Textarea label="Resultados" value={examForm.resultados} onChange={(e) => setExamForm((f) => ({ ...f, resultados: e.target.value }))} placeholder="Resultados del examen..." rows={3} />
          <Textarea label="Observaciones" value={examForm.observaciones} onChange={(e) => setExamForm((f) => ({ ...f, observaciones: e.target.value }))} placeholder="Opcional" rows={2} />
          <Button className="w-full" onClick={handleSaveExam} disabled={saving}>{saving ? "Guardando..." : "Guardar Examen"}</Button>
        </div>
      </Dialog>

      <Dialog open={showAppointment} onClose={() => setShowAppointment(false)} title="Agendar Control">
        <div className="space-y-4">
          {formError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
          <Input label="Fecha" type="date" value={appointmentForm.fecha} onChange={(e) => setAppointmentForm((f) => ({ ...f, fecha: e.target.value }))} />
          <Input label="Motivo" value={appointmentForm.motivo} onChange={(e) => setAppointmentForm((f) => ({ ...f, motivo: e.target.value }))} placeholder="Control post-operatorio..." />
          <Combobox label="Tipo" options={APPOINTMENT_TYPES} value={appointmentForm.tipo} onChange={(v) => setAppointmentForm((f) => ({ ...f, tipo: v }))} />
          <Textarea label="Observaciones" value={appointmentForm.observaciones} onChange={(e) => setAppointmentForm((f) => ({ ...f, observaciones: e.target.value }))} placeholder="Opcional" rows={2} />
          <Button className="w-full" onClick={handleSaveAppointment} disabled={saving}>{saving ? "Guardando..." : "Agendar Control"}</Button>
        </div>
      </Dialog>
    </div>
  );
}