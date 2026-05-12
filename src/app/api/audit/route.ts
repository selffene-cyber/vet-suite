import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { logAudit } from "@/lib/db/auth";


export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  const entidad = request.nextUrl.searchParams.get("entidad");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  if (!companyId) {
    return NextResponse.json({ error: "companyId requerido" }, { status: 400 });
  }

  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    let query = "SELECT * FROM audit_logs WHERE company_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    const params: unknown[] = [companyId, limit, offset];

    if (entidad) {
      query = "SELECT * FROM audit_logs WHERE company_id = ? AND entidad = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.unshift(entidad);
    }

    const result = await db.prepare(query).bind(...params).all();
    return NextResponse.json({ data: result.results });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const body = await request.json();
    await logAudit(
      db,
      body.companyId,
      body.userId || null,
      body.userRole || null,
      body.accion,
      body.entidad,
      body.entidadId || null,
      request.headers.get("x-forwarded-for") || "unknown",
      body.detalles ? JSON.stringify(body.detalles) : undefined
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}