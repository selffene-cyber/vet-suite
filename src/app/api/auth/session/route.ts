import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { verifySession, deleteSession } from "@/lib/db/auth";


export async function GET(request: NextRequest) {
  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await verifySession(db, token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const s = session as Record<string, unknown>;
    return NextResponse.json({
      authenticated: true,
      user: {
        id: s.id,
        nombre_completo: s.nombre_completo,
        correo: s.correo,
        rol: s.rol,
        company_id: s.company_id,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const db = getD1();

  try {
    const token = request.cookies.get("session")?.value;
    if (token && db) {
      await deleteSession(db, token);
    }
  } catch {}

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
  return response;
}