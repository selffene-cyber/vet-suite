import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getTutor, updateTutor } from "@/lib/db/tutors";
import { logAudit } from "@/lib/db/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  const { id } = await params;
  const tutor = await getTutor(db, id);
  if (!tutor) {
    return NextResponse.json({ error: "Tutor no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ tutor });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.nombre_completo || !body.telefono) {
      return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
    }

    const tutor = await updateTutor(db, id, body);

    await logAudit(db, "company-demo-001", null, null, "update", "tutor", id, request.headers.get("x-forwarded-for") || "unknown");

    return NextResponse.json({ tutor });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar tutor", details: String(error) }, { status: 500 });
  }
}