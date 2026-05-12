import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getAppointments, createAppointment, updateAppointment } from "@/lib/db/appointments";
import { addTimelineEvent } from "@/lib/db/clinical-timeline";

export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  const { searchParams } = new URL(request.url);
  const companyId = "company-demo-001";
  const filters: Record<string, unknown> = {};
  if (searchParams.get("patient_id")) filters.patient_id = searchParams.get("patient_id")!;
  if (searchParams.get("estado")) filters.estado = searchParams.get("estado")!;
  if (searchParams.get("desde")) filters.desde = searchParams.get("desde")!;
  if (searchParams.get("hasta")) filters.hasta = searchParams.get("hasta")!;
  const result = await getAppointments(db, companyId, Object.keys(filters).length > 0 ? filters : undefined);
  return NextResponse.json({ appointments: result.results });
}

export async function POST(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  try {
    const body = await request.json();
    if (!body.patient_id || !body.fecha || !body.motivo)
      return NextResponse.json({ error: "patient_id, fecha y motivo son obligatorios" }, { status: 400 });
    const companyId = "company-demo-001";
    const appointment = await createAppointment(db, companyId, body);
    await addTimelineEvent(db, companyId, {
      patient_id: body.patient_id,
      medical_record_id: body.medical_record_id || null,
      event_type: "control",
      event_date: body.fecha,
      title: `Control: ${body.motivo}`,
      description: body.observaciones || null,
      professional_id: body.veterinarian_id || null,
      related_id: (appointment as Record<string, unknown>).id as string,
    });
    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear control", details: String(error) }, { status: 500 });
  }
}