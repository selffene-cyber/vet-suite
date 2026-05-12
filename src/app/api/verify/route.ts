import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { verifyPrescriptionByCode } from "@/lib/db/prescriptions";
import { logAudit } from "@/lib/db/auth";


export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  }

  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const prescription = await verifyPrescriptionByCode(db, code);

    if (!prescription) {
      return NextResponse.json({ valid: false });
    }

    const p = prescription as Record<string, unknown>;
    const isVencida = new Date(p.fecha_vencimiento as string) < new Date();
    const isAnulada = p.estado === "anulada";
    const estado = isAnulada ? "Anulada" : isVencida ? "Vencida" : "Vigente";

    return NextResponse.json({
      valid: !isAnulada && !isVencida,
      folio: p.folio,
      fecha: p.fecha_emision,
      paciente: p.paciente_nombre || "—",
      medico: p.veterinario_nombre || "—",
      clinica: p.clinica_nombre || "—",
      estado,
    });
  } catch {
    return NextResponse.json({ valid: false });
  }
}