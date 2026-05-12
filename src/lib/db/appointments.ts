import type { D1Database } from "@cloudflare/workers-types";

export async function getAppointments(db: D1Database, companyId: string, filters?: Record<string, unknown>, limit = 50, offset = 0) {
  let query = "SELECT a.*, p.nombre as paciente_nombre, t.nombre_completo as tutor_nombre FROM appointments a JOIN patients p ON p.id = a.patient_id JOIN tutors t ON t.id = p.tutor_id WHERE a.company_id = ?";
  const params: unknown[] = [companyId];
  if (filters?.patient_id) { query += " AND a.patient_id = ?"; params.push(filters.patient_id); }
  if (filters?.estado) { query += " AND a.estado = ?"; params.push(filters.estado); }
  if (filters?.desde) { query += " AND a.fecha >= ?"; params.push(filters.desde); }
  if (filters?.hasta) { query += " AND a.fecha <= ?"; params.push(filters.hasta); }
  query += " ORDER BY a.fecha ASC LIMIT ? OFFSET ?";
  params.push(limit, offset);
  return db.prepare(query).bind(...params).all();
}

export async function getAppointment(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM appointments WHERE id = ?").bind(id).first();
}

export async function createAppointment(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO appointments (id, company_id, patient_id, medical_record_id, veterinarian_id, fecha, motivo, tipo, estado, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.patient_id, data.medical_record_id || null, data.veterinarian_id || null, data.fecha, data.motivo, data.tipo || 'control', data.estado || 'pendiente', data.observaciones || null).run();
  return getAppointment(db, id);
}

export async function updateAppointment(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined && k !== 'id');
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE appointments SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getAppointment(db, id);
}