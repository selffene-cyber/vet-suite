"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState({ patients: 0, tutors: 0, prescriptions: 0, pendingAppointments: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [pRes, tRes, apRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/tutors"),
          fetch("/api/appointments?estado=pendiente"),
        ]);
        if (pRes.ok) { const d = await pRes.json(); setStats(s => ({ ...s, patients: (d.patients || []).length })); }
        if (tRes.ok) { const d = await tRes.json(); setStats(s => ({ ...s, tutors: (d.tutors || []).length })); }
        if (apRes.ok) { const d = await apRes.json(); setStats(s => ({ ...s, pendingAppointments: (d.appointments || []).length })); }
      } catch {}
    })();
  }, []);

  const cards = [
    { label: "Pacientes", value: stats.patients, color: "text-green-600 dark:text-green-400", href: "/patients" },
    { label: "Tutores", value: stats.tutors, color: "text-blue-600 dark:text-blue-400", href: "/tutors" },
    { label: "Controles Pendientes", value: stats.pendingAppointments, color: "text-amber-600 dark:text-amber-400", href: "/appointments" },
    { label: "Recetas Hoy", value: stats.prescriptions, color: "text-red-600 dark:text-red-400", href: "/history" },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bienvenido a PiwiSuite Vet</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle></CardHeader>
              <CardContent><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Acciones Rápidas</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Link href="/prescriptions/new" className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h6M12 12v6" /></svg>
            <span className="text-xs font-medium">Nueva Receta</span>
          </Link>
          <Link href="/patients" className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><circle cx="12" cy="12" r="3" /><path d="M9 22v-1a3 3 0 0 1 6 0v1" /></svg>
            <span className="text-xs font-medium">Pacientes</span>
          </Link>
          <Link href="/appointments" className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span className="text-xs font-medium">Controles</span>
          </Link>
          <Link href="/tutors" className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            <span className="text-xs font-medium">Tutores</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}