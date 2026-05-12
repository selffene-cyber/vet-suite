import type { D1Database } from "@cloudflare/workers-types";

export async function getPatients(db: D1Database, companyId: string, search?: string, limit = 50, offset = 0) {
  if (search) {
    const term = `%${search}%`;
    return db.prepare(
      `SELECT p.*, t.nombre_completo as tutor_nombre, mr.numero_ficha FROM patients p JOIN tutors t ON t.id = p.tutor_id LEFT JOIN medical_records mr ON mr.patient_id = p.id WHERE p.company_id = ? AND (p.nombre LIKE ? OR t.nombre_completo LIKE ? OR t.rut LIKE ? OR t.telefono LIKE ? OR p.microchip LIKE ?) ORDER BY p.nombre LIMIT ? OFFSET ?`
    ).bind(companyId, term, term, term, term, term, limit, offset).all();
  }
  return db.prepare(
    "SELECT p.*, t.nombre_completo as tutor_nombre, mr.numero_ficha FROM patients p JOIN tutors t ON t.id = p.tutor_id LEFT JOIN medical_records mr ON mr.patient_id = p.id WHERE p.company_id = ? ORDER BY p.nombre LIMIT ? OFFSET ?"
  ).bind(companyId, limit, offset).all();
}

export async function getPatient(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM patients WHERE id = ?").bind(id).first();
}

export async function createPatient(db: D1Database, companyId: string, data: Record<string, unknown>) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO patients (id, company_id, tutor_id, nombre, especie, raza, sexo, fecha_nacimiento, edad, peso, color, microchip, foto_url, alergias, condiciones_relevantes, historial_resumen)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, data.tutor_id, data.nombre, data.especie, data.raza, data.sexo || 'desconocido', data.fecha_nacimiento || null, data.edad || null, data.peso || null, data.color || null, data.microchip || null, data.foto_url || null, data.alergias || null, data.condiciones_relevantes || null, data.historial_resumen || null).run();

  const count = await db.prepare("SELECT COUNT(*) as cnt FROM medical_records WHERE company_id = ?").bind(companyId).first();
  const num = ((count as Record<string, unknown>)?.cnt as number || 0) + 1;
  const numeroFicha = `FCH-${String(num).padStart(6, '0')}`;
  await db.prepare(
    `INSERT INTO medical_records (id, company_id, patient_id, numero_ficha, alergias, condiciones_preexistentes, observaciones_permanentes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), companyId, id, numeroFicha, data.alergias || null, data.condiciones_relevantes || null, null).run();

  await db.prepare(
    `INSERT INTO clinical_timeline (id, company_id, patient_id, event_type, event_date, title, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), companyId, id, 'registro', new Date().toISOString().split('T')[0], 'Paciente registrado', `${data.nombre} — ${data.especie} ${data.raza}`).run();

  return getPatient(db, id);
}

export async function updatePatient(db: D1Database, id: string, data: Record<string, unknown>) {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const values = fields.map(k => data[k]);
  const setClause = fields.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE patients SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  return getPatient(db, id);
}