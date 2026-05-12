import type { D1Database } from "@cloudflare/workers-types";

export async function createPrescription(db: D1Database, companyId: string, data: Record<string, unknown>, items: Record<string, unknown>[]) {
  const id = crypto.randomUUID();
  const codigoUnico = `VET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const codigoAlfanumerico = codigoUnico;

  const settings = await db.prepare("SELECT * FROM company_settings WHERE company_id = ?").bind(companyId).first();
  const prefijo = (settings as Record<string, unknown>)?.prefijo_folio as string || 'REC-';
  const folioInicial = ((settings as Record<string, unknown>)?.folio_inicial as number) || 1;

  const lastPrescription = await db.prepare("SELECT folio FROM prescriptions WHERE company_id = ? ORDER BY created_at DESC LIMIT 1").bind(companyId).first();
  let folioNumber = folioInicial;
  if (lastPrescription) {
    const match = ((lastPrescription as Record<string, unknown>)?.folio as string)?.match(/(\d+)$/);
    if (match) folioNumber = parseInt(match[1]) + 1;
  }
  const folio = `${prefijo}${String(folioNumber).padStart(6, '0')}`;

  let diasVigencia = 30;
  if (data.tipo_receta === 'receta_retenida') diasVigencia = ((settings as Record<string, unknown>)?.dias_vigencia_receta_retenida as number) || 30;
  else if (data.tipo_receta === 'receta_retenida_control_saldo') diasVigencia = ((settings as Record<string, unknown>)?.dias_vigencia_receta_control_saldo as number) || 90;

  const now = new Date();
  const fechaEmision = now.toISOString().split('T')[0];
  const horaEmision = now.toTimeString().substring(0, 5);
  const fechaVencimiento = new Date(now.getTime() + diasVigencia * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const hashPayload = JSON.stringify({ id, folio, codigo_unico: codigoUnico, fecha: fechaEmision, paciente: data.patient_id, medico: data.veterinarian_id });
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(hashPayload));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashSha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  await db.prepare(
    `INSERT INTO prescriptions (id, company_id, codigo_unico, folio, fecha_emision, hora_emision, tutor_id, patient_id, veterinarian_id, diagnostico, tipo_receta, observaciones_clinicas, fecha_vencimiento, firma_imagen_url, hash_sha256, codigo_qr, codigo_alfanumerico, estado, receta_reemplazo_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, companyId, codigoUnico, folio, fechaEmision, horaEmision, data.tutor_id, data.patient_id, data.veterinarian_id, data.diagnostico, data.tipo_receta, data.observaciones_clinicas || null, fechaVencimiento, data.firma_imagen_url || null, hashSha256, codigoUnico, codigoAlfanumerico, 'emitida', data.receta_reemplazo_id || null).run();

  for (const item of items) {
    const itemId = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO prescription_items (id, prescription_id, medicine_id, nombre_medicamento, principio_activo, dosis, frecuencia, duracion, via_administracion, cantidad, indicaciones, advertencias, condicion_venta, es_antimicrobiano)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(itemId, id, item.medicine_id, item.nombre_medicamento, item.principio_activo, item.dosis, item.frecuencia, item.duracion, item.via_administracion, item.cantidad, item.indicaciones, item.advertencias || null, item.condicion_venta, item.es_antimicrobiano ? 1 : 0).run();
  }

  return db.prepare("SELECT * FROM prescriptions WHERE id = ?").bind(id).first();
}

export async function getPrescription(db: D1Database, id: string) {
  const prescription = await db.prepare("SELECT * FROM prescriptions WHERE id = ?").bind(id).first();
  if (!prescription) return null;
  const items = await db.prepare("SELECT * FROM prescription_items WHERE prescription_id = ?").bind(id).all();
  return { ...prescription, items: items.results };
}

export async function getPrescriptions(db: D1Database, companyId: string, filters?: Record<string, unknown>, limit = 50, offset = 0) {
  let query = "SELECT p.*, t.nombre_completo as tutor_nombre, pat.nombre as paciente_nombre, v.nombre_completo as veterinario_nombre FROM prescriptions p LEFT JOIN tutors t ON t.id = p.tutor_id LEFT JOIN patients pat ON pat.id = p.patient_id LEFT JOIN veterinarians v ON v.id = p.veterinarian_id WHERE p.company_id = ?";
  const params: unknown[] = [companyId];

  if (filters?.estado) {
    query += " AND p.estado = ?";
    params.push(filters.estado);
  }
  if (filters?.tipo_receta) {
    query += " AND p.tipo_receta = ?";
    params.push(filters.tipo_receta);
  }
  if (filters?.desde) {
    query += " AND p.fecha_emision >= ?";
    params.push(filters.desde);
  }
  if (filters?.hasta) {
    query += " AND p.fecha_emision <= ?";
    params.push(filters.hasta);
  }
  if (filters?.search) {
    query += " AND (p.folio LIKE ? OR t.nombre_completo LIKE ? OR pat.nombre LIKE ?)";
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  return db.prepare(query).bind(...params).all();
}

export async function annulPrescription(db: D1Database, id: string) {
  await db.prepare("UPDATE prescriptions SET estado = 'anulada' WHERE id = ?").bind(id).run();
  return getPrescription(db, id);
}

export async function verifyPrescriptionByCode(db: D1Database, code: string) {
  const prescription = await db.prepare("SELECT p.*, c.nombre_fantasia as clinica_nombre, c.rut as clinica_rut, v.nombre_completo as veterinario_nombre, v.nro_registro_profesional, pat.nombre as paciente_nombre, t.nombre_completo as tutor_nombre FROM prescriptions p LEFT JOIN companies c ON c.id = p.company_id LEFT JOIN veterinarians v ON v.id = p.veterinarian_id LEFT JOIN patients pat ON pat.id = p.patient_id LEFT JOIN tutors t ON t.id = p.tutor_id WHERE p.codigo_alfanumerico = ? OR p.codigo_qr = ?").bind(code, code).first();
  return prescription;
}