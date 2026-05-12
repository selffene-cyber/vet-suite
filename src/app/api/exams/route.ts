import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getExams, createExam } from "@/lib/db/exams";
import { addTimelineEvent } from "@/lib/db/clinical-timeline";

export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");
  if (!patientId) return NextResponse.json({ error: "patient_id requerido" }, { status: 400 });
  const result = await getExams(db, patientId);
  return NextResponse.json({ exams: result.results });
}

export async function POST(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  try {
    const body = await request.json();
    if (!body.patient_id || !body.tipo_examen || !body.fecha)
      return NextResponse.json({ error: "patient_id, tipo_examen y fecha son obligatorios" }, { status: 400 });
    const companyId = "company-demo-001";
    const exam = await createExam(db, companyId, body);
    await addTimelineEvent(db, companyId, {
      patient_id: body.patient_id,
      medical_record_id: body.medical_record_id || null,
      event_type: "examen",
      event_date: body.fecha,
      title: `Examen: ${body.tipo_examen}`,
      description: body.resultados || body.observaciones || null,
      professional_id: body.veterinarian_id || null,
      related_id: (exam as Record<string, unknown>).id as string,
    });
    return NextResponse.json({ exam });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear examen", details: String(error) }, { status: 500 });
  }
}