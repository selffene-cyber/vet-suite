import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { getCompany, updateCompany, upsertCompanySettings, getCompanySettings } from "@/lib/db/companies";
import { logAudit } from "@/lib/db/auth";


export async function GET() {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  const companyId = "company-demo-001";
  const company = await getCompany(db, companyId);
  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }
  const settings = await getCompanySettings(db, companyId);
  return NextResponse.json({ company, settings });
}


export async function PUT(request: NextRequest) {
  const db = getD1();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const companyId = body.companyId || "company-demo-001";

    const companyFields: Record<string, unknown> = {};
    const settingFields: Record<string, unknown> = {};

    const companyKeys = ["raz_social", "nombre_fantasia", "rut", "direccion", "comuna", "region", "telefono", "correo_contacto", "sitio_web", "nro_autorizacion_sanitaria", "logo_url", "timbre_url", "texto_legal_pie"];
    const settingKeys = ["folio_inicial", "prefijo_folio", "dias_vigencia_receta_simple", "dias_vigencia_receta_retenida", "dias_vigencia_receta_control_saldo", "correo_remitente", "firma_config"];

    for (const key of companyKeys) {
      if (body[key] !== undefined) companyFields[key] = body[key];
    }
    for (const key of settingKeys) {
      if (body[key] !== undefined) settingFields[key] = body[key];
    }

    if (Object.keys(companyFields).length > 0) {
      await updateCompany(db, companyId, companyFields);
    }
    if (Object.keys(settingFields).length > 0) {
      await upsertCompanySettings(db, companyId, settingFields);
    }

    await logAudit(db, companyId, null, null, "update", "company", companyId, request.headers.get("x-forwarded-for") || "unknown", JSON.stringify({ companyFields, settingFields }));

    const company = await getCompany(db, companyId);
    const settings = await getCompanySettings(db, companyId);
    return NextResponse.json({ company, settings });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar empresa", details: String(error) }, { status: 500 });
  }
}