import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getTutors, createTutor } from "@/lib/db/tutors";
import { logAudit } from "@/lib/db/auth";
import { validateRutChile } from "@/utils/helpers";


export async function GET(request: NextRequest) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const companyId = "company-demo-001";
  const result = await getTutors(db, companyId, search);
  return NextResponse.json({ tutors: result.results });
}


export async function POST(request: NextRequest) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const companyId = "company-demo-001";

    if (!body.nombre_completo || !body.rut || !body.telefono || !body.direccion || !body.comuna || !body.region) {
      return NextResponse.json({ error: "Nombre, RUT, teléfono, dirección, comuna y región son obligatorios" }, { status: 400 });
    }

    if (!validateRutChile(body.rut)) {
      return NextResponse.json({ error: "RUT inválido" }, { status: 400 });
    }

    const tutor = await createTutor(db, companyId, body);

    await logAudit(db, companyId, null, null, "create", "tutor", (tutor as Record<string, unknown>).id as string, request.headers.get("x-forwarded-for") || "unknown");

    return NextResponse.json({ tutor });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear tutor", details: String(error) }, { status: 500 });
  }
}