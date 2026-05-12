-- PiwiSuite Vet - Clinical Records & Timeline
-- Adds medical records, consultations, exams, appointments, clinical timeline, attachments

CREATE TABLE IF NOT EXISTS medical_records (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  numero_ficha TEXT NOT NULL,
  alergias TEXT,
  condiciones_preexistentes TEXT,
  observaciones_permanentes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, patient_id)
);

CREATE TABLE IF NOT EXISTS clinical_timeline (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  professional_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  related_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
  veterinarian_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  fecha TEXT NOT NULL,
  motivo TEXT NOT NULL,
  anamnesis TEXT,
  examen_fisico TEXT,
  diagnostico TEXT,
  tratamiento TEXT,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'realizada',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
  veterinarian_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  tipo_examen TEXT NOT NULL,
  fecha TEXT NOT NULL,
  resultados TEXT,
  archivo_url TEXT,
  observaciones TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
  veterinarian_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  fecha TEXT NOT NULL,
  motivo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'control',
  estado TEXT NOT NULL DEFAULT 'pendiente',
  observaciones TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  archivo_url TEXT NOT NULL,
  descripcion TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_company ON medical_records(company_id);
CREATE INDEX IF NOT EXISTS idx_clinical_timeline_patient ON clinical_timeline(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_timeline_date ON clinical_timeline(event_date);
CREATE INDEX IF NOT EXISTS idx_clinical_timeline_type ON clinical_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(fecha);
CREATE INDEX IF NOT EXISTS idx_exams_patient ON exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(fecha);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(fecha);
CREATE INDEX IF NOT EXISTS idx_appointments_estado ON appointments(estado);
CREATE INDEX IF NOT EXISTS idx_attachments_patient ON attachments(patient_id);

CREATE TRIGGER IF NOT EXISTS update_medical_records_updated_at AFTER UPDATE ON medical_records FOR EACH ROW BEGIN UPDATE medical_records SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_consultations_updated_at AFTER UPDATE ON consultations FOR EACH ROW BEGIN UPDATE consultations SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_exams_updated_at AFTER UPDATE ON exams FOR EACH ROW BEGIN UPDATE exams SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_appointments_updated_at AFTER UPDATE ON appointments FOR EACH ROW BEGIN UPDATE appointments SET updated_at = datetime('now') WHERE id = NEW.id; END;