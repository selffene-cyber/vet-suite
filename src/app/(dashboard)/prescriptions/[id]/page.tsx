"use client";

import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrescriptionStatusLabel } from "@/utils";

export default function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Detalle de Receta</h1>
        <Badge>—</Badge>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Folio</p>
            <p className="text-lg font-mono font-bold">—</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="text-sm font-medium">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tutor</p>
              <p className="text-sm font-medium">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Médico</p>
              <p className="text-sm font-medium">—</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="text-sm font-medium">—</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Diagnóstico</p>
            <p className="text-sm">—</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Medicamentos</p>
            <p className="text-sm text-muted-foreground">—</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Ver PDF
        </Button>
        <Button variant="outline" className="w-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Descargar
        </Button>
        <Button variant="outline" className="w-full col-span-1">
          Compartir
        </Button>
        <Button variant="outline" className="w-full col-span-1 text-destructive hover:text-destructive">
          Anular
        </Button>
      </div>
    </div>
  );
}