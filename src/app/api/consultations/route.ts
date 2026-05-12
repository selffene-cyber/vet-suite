import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getConsultations, createConsultation } from "@/lib/db/consultations";
import { addTimelineEvent } from "@/lib/db/clinical-timeline";

export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");
  if (!patientId) return NextResponse.json({ error: "patient_id requerido" }, { status: 400 });
  const result = await getConsultations(db, patientId);
  return NextResponse.json({ consultations: result.results });
}

export async function POST(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  try {
    const body = await request.json();
    if (!body.patient_id || !body.fecha || !body.motivo)
      return NextResponse.json({ error: "patient_id, fecha y motivo son obligatorios" }, { status: 400 });
    const companyId = "company-demo-001";
    const consultation = await createConsultation(db, companyId, body);
    await addTimelineEvent(db, companyId, {
      patient_id: body.patient_id,
      medical_record_id: body.medical_record_id || null,
      event_type: "consulta",
      event_date: body.fecha,
      title: `Consulta: ${body.motivo}`,
      description: body.diagnostico || body.motivo,
      professional_id: body.veterinarian_id || null,
      related_id: (consultation as Record<string, unknown>).id as string,
    });
    return NextResponse.json({ consultation });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear consulta", details: String(error) }, { status: 500 });
  }
}