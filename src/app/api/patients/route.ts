import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getPatients, createPatient } from "@/lib/db/patients";
import { logAudit } from "@/lib/db/auth";


export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const companyId = "company-demo-001";
  const result = await getPatients(db, companyId, search);
  return NextResponse.json({ patients: result.results });
}


export async function POST(request: NextRequest) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const companyId = "company-demo-001";

    if (!body.nombre || !body.tutor_id || !body.especie || !body.raza) {
      return NextResponse.json({ error: "Nombre, tutor, especie y raza son obligatorios" }, { status: 400 });
    }

    const patient = await createPatient(db, companyId, body);

    await logAudit(db, companyId, null, null, "create", "patient", (patient as Record<string, unknown>).id as string, request.headers.get("x-forwarded-for") || "unknown");

    return NextResponse.json({ patient });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear paciente", details: String(error) }, { status: 500 });
  }
}