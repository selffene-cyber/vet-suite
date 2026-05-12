import type { D1Database } from "@cloudflare/workers-types";

export async function getExams(db: D1Database, patientId: string, limit = 50, offset = 0) {
  return db.prepare(
    "SELECT * FROM exams WHERE patient_id = ? ORDER BY fecha DESC LIMIT ? OFFSET ?"
  ).bind(patientId, limit, offset).all();
}

export async function getExam(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM exams WHERE id = ?").bind(id).first();
}

export async function createExam(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO exams (id, company_id, patient_id, medical_record_id, veterinarian_id, tipo_examen, fecha, resultados, archivo_url, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.patient_id, data.medical_record_id || null, data.veterinarian_id || null, data.tipo_examen, data.fecha, data.resultados || null, data.archivo_url || null, data.observaciones || null).run();
  return getExam(db, id);
}

export async function updateExam(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined && k !== 'id');
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE exams SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getExam(db, id);
}