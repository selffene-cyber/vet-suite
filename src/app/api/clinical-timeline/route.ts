import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getPatientTimeline } from "@/lib/db/clinical-timeline";

export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");
  if (!patientId) return NextResponse.json({ error: "patient_id requerido" }, { status: 400 });
  const result = await getPatientTimeline(db, patientId);
  return NextResponse.json({ timeline: result.results });
}