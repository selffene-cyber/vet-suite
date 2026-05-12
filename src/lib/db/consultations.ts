import type { D1Database } from "@cloudflare/workers-types";

export async function getConsultations(db: D1Database, patientId: string, limit = 50, offset = 0) {
  return db.prepare(
    "SELECT * FROM consultations WHERE patient_id = ? ORDER BY fecha DESC LIMIT ? OFFSET ?"
  ).bind(patientId, limit, offset).all();
}

export async function getConsultation(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM consultations WHERE id = ?").bind(id).first();
}

export async function createConsultation(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO consultations (id, company_id, patient_id, medical_record_id, veterinarian_id, fecha, motivo, anamnesis, examen_fisico, diagnostico, tratamiento, observaciones, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.patient_id, data.medical_record_id || null, data.veterinarian_id || null, data.fecha, data.motivo, data.anamnesis || null, data.examen_fisico || null, data.diagnostico || null, data.tratamiento || null, data.observaciones || null, data.estado || 'realizada').run();
  return getConsultation(db, id);
}

export async function updateConsultation(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined && k !== 'id');
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE consultations SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getConsultation(db, id);
}