import type { D1Database } from "@cloudflare/workers-types";

export async function getMedicalRecord(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM medical_records WHERE id = ?").bind(id).first();
}

export async function getMedicalRecordByPatient(db: D1Database, patientId: string) {
  return db.prepare("SELECT * FROM medical_records WHERE patient_id = ?").bind(patientId).first();
}

export async function createMedicalRecord(db: D1Database, companyId: string, patientId: string, data?: Record<string, unknown>) {
  const id = crypto.randomUUID();
  const count = await db.prepare("SELECT COUNT(*) as cnt FROM medical_records WHERE company_id = ?").bind(companyId).first();
  const num = ((count as Record<string, unknown>)?.cnt as number || 0) + 1;
  const numeroFicha = `FCH-${String(num).padStart(6, '0')}`;
  await db.prepare(
    `INSERT INTO medical_records (id, company_id, patient_id, numero_ficha, alergias, condiciones_preexistentes, observaciones_permanentes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, patientId, numeroFicha, data?.alergias || null, data?.condiciones_preexistentes || null, data?.observaciones_permanentes || null).run();
  return getMedicalRecord(db, id);
}

export async function updateMedicalRecord(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined && k !== 'id');
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE medical_records SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getMedicalRecord(db, id);
}