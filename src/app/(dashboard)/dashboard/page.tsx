import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const stats = [
    { label: "Recetas Hoy", value: "0", color: "text-blue-600 dark:text-blue-400" },
    { label: "Pacientes Activos", value: "0", color: "text-green-600 dark:text-green-400" },
    { label: "Recetas Vigentes", value: "0", color: "text-amber-600 dark:text-amber-400" },
    { label: "Recetas por Vencer", value: "0", color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenido a PiwiSuite Vet
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Link
            href="/prescriptions/new"
            className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 15h6M12 12v6" />
            </svg>
            <span className="text-xs font-medium">Nueva Receta</span>
          </Link>
          <Link
            href="/patients"
            className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <circle cx="12" cy="12" r="3" />
              <path d="M9 22v-1a3 3 0 0 1 6 0v1" />
            </svg>
            <span className="text-xs font-medium">Pacientes</span>
          </Link>
          <Link
            href="/tutors"
            className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xs font-medium">Tutores</span>
          </Link>
          <Link
            href="/history"
            className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors touch-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-medium">Historial</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}