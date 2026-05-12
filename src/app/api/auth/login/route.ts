import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { authenticateUser, createSession } from "@/lib/db/auth";


export async function POST(request: NextRequest) {
  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const { correo, password } = await request.json();

    if (!correo || !password) {
      return NextResponse.json({ error: "Correo y contraseña requeridos" }, { status: 400 });
    }

    const user = await authenticateUser(db, correo, password);

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = await createSession(db, (user as Record<string, unknown>).id as string);

    const response = NextResponse.json({
      success: true,
      user: {
        id: (user as Record<string, unknown>).id,
        nombre_completo: (user as Record<string, unknown>).nombre_completo,
        correo: (user as Record<string, unknown>).correo,
        rol: (user as Record<string, unknown>).rol,
        company_id: (user as Record<string, unknown>).company_id,
      },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}