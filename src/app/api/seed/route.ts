import { NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { hashPassword } from "@/lib/db/auth";


export async function POST() {
  const db = getD1();

  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const passwordHash = await hashPassword("admin123");

    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO companies (id, raz_social, nombre_fantasia, rut, direccion, comuna, region, telefono, correo_contacto, plan, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        "company-demo-001",
        "Veterinaria Demo SpA",
        "VetDemo",
        "76.543.210-K",
        "Av. Providencia 1234",
        "Providencia",
        "rm",
        "+56912345678",
        "contacto@vetdemo.cl",
        "profesional",
        "active"
      ),
      db.prepare(`INSERT OR IGNORE INTO company_settings (id, company_id, correo_remitente) VALUES (?, ?, ?)`).bind(
        "settings-demo-001",
        "company-demo-001",
        "noreply@vetdemo.cl"
      ),
      db.prepare(`INSERT OR IGNORE INTO users (id, company_id, nombre_completo, rut, correo, telefono, cargo, rol, estado, requiere_cambio_password, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        "user-admin-001",
        "company-demo-001",
        "Administrador Demo",
        "12.345.678-5",
        "admin@vetdemo.cl",
        "+56987654321",
        "Administrador",
        "admin",
        "active",
        1,
        passwordHash
      ),
      db.prepare(`INSERT OR IGNORE INTO veterinarians (id, company_id, user_id, nombre_completo, rut, nro_registro_profesional, especialidad, correo, telefono, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        "vet-demo-001",
        "company-demo-001",
        "user-admin-001",
        "Dr. Administrador Demo",
        "12.345.678-5",
        "MV-12345",
        "Medicina General",
        "admin@vetdemo.cl",
        "+56987654321",
        "active"
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Seed data created",
      credentials: {
        correo: "admin@vetdemo.cl",
        password: "admin123",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}