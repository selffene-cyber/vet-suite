import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getMedicalRecordByPatient, updateMedicalRecord } from "@/lib/db/medical-records";

export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");
  if (!patientId) return NextResponse.json({ error: "patient_id requerido" }, { status: 400 });
  const record = await getMedicalRecordByPatient(db, patientId);
  return NextResponse.json({ medical_record: record });
}

export async function PUT(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const record = await updateMedicalRecord(db, body.id, body);
    return NextResponse.json({ medical_record: record });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar ficha", details: String(error) }, { status: 500 });
  }
}