"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/appointments?estado=pendiente");
        if (res.ok) { const d = await res.json(); setAppointments(d.appointments || []); }
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Cargando...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Controles y Agenda</h1>
      {appointments.length === 0 && <div className="text-sm text-muted-foreground">No hay controles pendientes</div>}
      {appointments.map((ap) => (
        <Card key={ap.id as string} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => { window.location.href = `/patients/${ap.patient_id}`; }}>
          <CardContent className="pt-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{ap.paciente_nombre as string || "Paciente"}</p>
                <p className="text-xs text-muted-foreground">{ap.motivo as string}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ap.fecha as string} · {String(ap.tipo || "").replace(/_/g, " ")}</p>
              </div>
              <Badge className={(ap.estado as string) === "pendiente" ? "bg-amber-100 text-amber-800" : (ap.estado as string) === "realizado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {String(ap.estado || "").charAt(0).toUpperCase() + String(ap.estado || "").slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}