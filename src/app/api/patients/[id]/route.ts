import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getPatient, updatePatient } from "@/lib/db/patients";
import { logAudit } from "@/lib/db/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  const { id } = await params;
  const patient = await getPatient(db, id);
  if (!patient) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ patient });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.nombre || !body.especie || !body.raza) {
      return NextResponse.json({ error: "Nombre, especie y raza son obligatorios" }, { status: 400 });
    }

    const patient = await updatePatient(db, id, body);

    await logAudit(db, "company-demo-001", null, null, "update", "patient", id, request.headers.get("x-forwarded-for") || "unknown");

    return NextResponse.json({ patient });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar paciente", details: String(error) }, { status: 500 });
  }
}