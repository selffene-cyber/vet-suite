import type { D1Database } from "@cloudflare/workers-types";

export async function getCompany(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM companies WHERE id = ?").bind(id).first();
}

export async function getCompanySettings(db: D1Database, companyId: string) {
  return db.prepare("SELECT * FROM company_settings WHERE company_id = ?").bind(companyId).first();
}

export async function createCompany(db: D1Database, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO companies (id, raz_social, nombre_fantasia, rut, direccion, comuna, region, telefono, correo_contacto, sitio_web, nro_autorizacion_sanitaria, texto_legal_pie, plan, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, data.raz_social, data.nombre_fantasia, data.rut, data.direccion,
    data.comuna, data.region, data.telefono, data.correo_contacto,
    data.sitio_web || null, data.nro_autorizacion_sanitaria || null,
    data.texto_legal_pie || null, data.plan || 'basico', 'active'
  ).run();
  return { id, ...data };
}

export async function updateCompany(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE companies SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getCompany(db, id);
}

export async function upsertCompanySettings(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const existing = await getCompanySettings(db, companyId);
  if (existing) {
    const fields = Object.keys(data).filter(k => data[k] !== undefined);
    const values = fields.map(k => data[k]);
    const setClause = fields.map(k => `${k} = ?`).join(', ');
    await db.prepare(`UPDATE company_settings SET ${setClause} WHERE company_id = ?`).bind(...values, companyId).run();
  } else {
    const id = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO company_settings (id, company_id, folio_inicial, prefijo_folio, dias_vigencia_receta_simple, dias_vigencia_receta_retenida, dias_vigencia_receta_control_saldo, modulos_activos, correo_remitente, firma_config)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, companyId, data.folio_inicial || 1, data.prefijo_folio || 'REC-',
      data.dias_vigencia_receta_simple || 30, data.dias_vigencia_receta_retenida || 30,
      data.dias_vigencia_receta_control_saldo || 90, data.modulos_activos || 'prescriptions,patients,tutors,medicines',
      data.correo_remitente, data.firma_config || 'imagen'
    ).run();
  }
  return getCompanySettings(db, companyId);
}