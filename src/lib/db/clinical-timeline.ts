import type { D1Database } from "@cloudflare/workers-types";

export async function addTimelineEvent(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO clinical_timeline (id, company_id, patient_id, medical_record_id, event_type, event_date, title, description, professional_id, related_id, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.patient_id, data.medical_record_id || null, data.event_type, data.event_date, data.title, data.description || null, data.professional_id || null, data.related_id || null, data.metadata || null).run();
  return db.prepare("SELECT * FROM clinical_timeline WHERE id = ?").bind(id).first();
}

export async function getPatientTimeline(db: D1Database, patientId: string, limit = 50, offset = 0) {
  return db.prepare(
    "SELECT * FROM clinical_timeline WHERE patient_id = ? ORDER BY event_date DESC, created_at DESC LIMIT ? OFFSET ?"
  ).bind(patientId, limit, offset).all();
}

export async function deleteTimelineEvent(db: D1Database, id: string) {
  await db.prepare("DELETE FROM clinical_timeline WHERE id = ?").bind(id).run();
}