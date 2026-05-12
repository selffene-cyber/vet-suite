import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { createPrescription } from "@/lib/db/prescriptions";
import { logAudit } from "@/lib/db/auth";


export async function POST(request: NextRequest) {
  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { companyId, tutorId, patientId, veterinarianId, diagnostico, tipoReceta, observaciones, items, userId, userRole } = body;

    if (!companyId || !patientId || !tutorId || !veterinarianId || !diagnostico || !items?.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const prescription = await createPrescription(db, companyId, {
      tutor_id: tutorId,
      patient_id: patientId,
      veterinarian_id: veterinarianId,
      diagnostico,
      tipo_receta: tipoReceta || "receta_simple",
      observaciones_clinicas: observaciones || null,
      firma_imagen_url: body.firmaImagenUrl || null,
      receta_reemplazo_id: body.recetaReemplazoId || null,
    }, items);

    await logAudit(db, companyId, userId || null, userRole || null, "prescripcion_emitida", "prescriptions", (prescription as Record<string, unknown>)?.id as string || null, request.headers.get("x-forwarded-for") || "unknown");

    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}