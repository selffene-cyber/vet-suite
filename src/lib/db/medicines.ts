import type { D1Database } from "@cloudflare/workers-types";

export async function getMedicines(db: D1Database, companyId: string, search?: string, condicionVenta?: string, antimicrobiano?: boolean, limit = 50, offset = 0) {
  let query = `SELECT m.*, cm.activo FROM medicines m JOIN company_medicines cm ON cm.medicine_id = m.id WHERE cm.company_id = ? AND cm.activo = 1`;
  const params: unknown[] = [companyId];

  if (search) {
    query += ` AND (m.nombre_comercial LIKE ? OR m.principio_activo LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (condicionVenta) {
    query += ` AND m.condicion_venta = ?`;
    params.push(condicionVenta);
  }
  if (antimicrobiano !== undefined) {
    query += ` AND m.es_antimicrobiano = ?`;
    params.push(antimicrobiano ? 1 : 0);
  }
  query += ` ORDER BY m.nombre_comercial LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return db.prepare(query).bind(...params).all();
}

export async function getMedicine(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM medicines WHERE id = ?").bind(id).first();
}

export async function createMedicine(db: D1Database, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO medicines (id, nombre_comercial, principio_activo, forma_farmaceutica, concentracion, laboratorio, registro_sag, especie_permitida, condicion_venta, clasificacion_terapeutica, es_antimicrobiano, control_especial)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.nombre_comercial, data.principio_activo, data.forma_farmaceutica, data.concentracion, data.laboratorio, data.registro_sag || null, data.especie_permitida || null, data.condicion_venta || 'venta_libre', data.clasificacion_terapeutica || null, data.es_antimicrobiano ? 1 : 0, data.control_especial ? 1 : 0).run();
  return getMedicine(db, id);
}

export async function addMedicineToCompany(db: D1Database, companyId: string, medicineId: string) {
  const id = crypto.randomUUID();
  await db.prepare("INSERT OR IGNORE INTO company_medicines (id, company_id, medicine_id, activo) VALUES (?, ?, ?, 1)").bind(id, companyId, medicineId).run();
}