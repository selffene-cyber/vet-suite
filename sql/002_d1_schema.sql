-- PiwiSuite Vet - D1 Schema (SQLite)
-- Cloudflare D1 database for multi-tenant veterinary management
-- Compliant with Chilean regulations: Decreto N°25/2005, Ley 19.799, Ley 19.628

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  raz_social TEXT NOT NULL,
  nombre_fantasia TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE,
  direccion TEXT NOT NULL,
  comuna TEXT NOT NULL,
  region TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo_contacto TEXT NOT NULL,
  sitio_web TEXT,
  logo_url TEXT,
  timbre_url TEXT,
  nro_autorizacion_sanitaria TEXT,
  texto_legal_pie TEXT,
  plan TEXT NOT NULL DEFAULT 'basico',
  estado TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS company_settings (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  folio_inicial INTEGER NOT NULL DEFAULT 1,
  prefijo_folio TEXT NOT NULL DEFAULT 'REC-',
  dias_vigencia_receta_simple INTEGER NOT NULL DEFAULT 30,
  dias_vigencia_receta_retenida INTEGER NOT NULL DEFAULT 30,
  dias_vigencia_receta_control_saldo INTEGER NOT NULL DEFAULT 90,
  modulos_activos TEXT NOT NULL DEFAULT 'prescriptions,patients,tutors,medicines',
  correo_remitente TEXT NOT NULL,
  firma_config TEXT NOT NULL DEFAULT 'imagen',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL,
  correo TEXT NOT NULL,
  telefono TEXT,
  cargo TEXT,
  rol TEXT NOT NULL DEFAULT 'assistant',
  estado TEXT NOT NULL DEFAULT 'active',
  requiere_cambio_password INTEGER NOT NULL DEFAULT 1,
  auth_2fa_habilitada INTEGER NOT NULL DEFAULT 0,
  ultimo_acceso TEXT,
  veterinarian_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  auth_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, correo),
  UNIQUE(company_id, rut)
);

CREATE TABLE IF NOT EXISTS veterinarians (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL,
  nro_registro_profesional TEXT NOT NULL,
  especialidad TEXT,
  correo TEXT NOT NULL,
  telefono TEXT NOT NULL,
  firma_url TEXT,
  timbre_url TEXT,
  es_independiente INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, rut),
  UNIQUE(company_id, nro_registro_profesional)
);

CREATE TABLE IF NOT EXISTS tutors (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT,
  direccion TEXT NOT NULL,
  comuna TEXT NOT NULL,
  region TEXT NOT NULL,
  observaciones TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, rut)
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tutor_id TEXT NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  especie TEXT NOT NULL,
  raza TEXT NOT NULL,
  sexo TEXT NOT NULL DEFAULT 'desconocido',
  fecha_nacimiento TEXT,
  edad TEXT,
  peso REAL,
  color TEXT,
  microchip TEXT,
  foto_url TEXT,
  alergias TEXT,
  condiciones_relevantes TEXT,
  historial_resumen TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  nombre_comercial TEXT NOT NULL,
  principio_activo TEXT NOT NULL,
  forma_farmaceutica TEXT NOT NULL,
  concentracion TEXT NOT NULL,
  laboratorio TEXT NOT NULL,
  registro_sag TEXT,
  especie_permitida TEXT,
  condicion_venta TEXT NOT NULL DEFAULT 'venta_libre',
  clasificacion_terapeutica TEXT,
  es_antimicrobiano INTEGER NOT NULL DEFAULT 0,
  control_especial INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS company_medicines (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  medicine_id TEXT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  codigo_unico TEXT NOT NULL UNIQUE,
  folio TEXT NOT NULL,
  fecha_emision TEXT NOT NULL DEFAULT (date('now')),
  hora_emision TEXT NOT NULL DEFAULT (time('now')),
  tutor_id TEXT NOT NULL REFERENCES tutors(id) ON DELETE RESTRICT,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  veterinarian_id TEXT NOT NULL REFERENCES veterinarians(id) ON DELETE RESTRICT,
  diagnostico TEXT NOT NULL,
  tipo_receta TEXT NOT NULL DEFAULT 'receta_simple',
  observaciones_clinicas TEXT,
  fecha_vencimiento TEXT NOT NULL,
  firma_imagen_url TEXT,
  hash_sha256 TEXT NOT NULL,
  codigo_qr TEXT NOT NULL,
  codigo_alfanumerico TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL DEFAULT 'emitida',
  receta_reemplazo_id TEXT REFERENCES prescriptions(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id TEXT PRIMARY KEY,
  prescription_id TEXT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id TEXT NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
  nombre_medicamento TEXT NOT NULL,
  principio_activo TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  duracion TEXT NOT NULL,
  via_administracion TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  indicaciones TEXT NOT NULL,
  advertencias TEXT,
  condicion_venta TEXT NOT NULL,
  es_antimicrobiano INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS prescription_pdf_files (
  id TEXT PRIMARY KEY,
  prescription_id TEXT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  pdf_size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(prescription_id)
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id TEXT PRIMARY KEY,
  codigo_verificado TEXT NOT NULL,
  tipo_verificacion TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  resultado TEXT NOT NULL,
  prescription_id TEXT REFERENCES prescriptions(id) ON DELETE SET NULL,
  verified_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id TEXT,
  user_rol TEXT,
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  entidad_id TEXT,
  detalles TEXT,
  ip_address TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS uploaded_signatures (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  precio_mensual REAL NOT NULL,
  max_usuarios INTEGER NOT NULL,
  max_recetas_mes INTEGER NOT NULL,
  funcionalidades TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_estado ON companies(estado);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_correo ON users(correo);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_veterinarians_company ON veterinarians(company_id);
CREATE INDEX IF NOT EXISTS idx_tutors_company ON tutors(company_id);
CREATE INDEX IF NOT EXISTS idx_patients_company ON patients(company_id);
CREATE INDEX IF NOT EXISTS idx_patients_tutor ON patients(tutor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_company ON prescriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_folio ON prescriptions(folio);
CREATE INDEX IF NOT EXISTS idx_prescriptions_codigo ON prescriptions(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tutor ON prescriptions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_vet ON prescriptions(veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_estado ON prescriptions(estado);
CREATE INDEX IF NOT EXISTS idx_prescriptions_fecha ON prescriptions(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tipo ON prescriptions(tipo_receta);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_codigo ON verification_logs(codigo_verificado);
CREATE INDEX IF NOT EXISTS idx_verification_logs_fecha ON verification_logs(verified_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_medicines_nombre ON medicines(nombre_comercial);
CREATE INDEX IF NOT EXISTS idx_medicines_sag ON medicines(registro_sag);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_companies_updated_at AFTER UPDATE ON companies FOR EACH ROW BEGIN UPDATE companies SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_company_settings_updated_at AFTER UPDATE ON company_settings FOR EACH ROW BEGIN UPDATE company_settings SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_users_updated_at AFTER UPDATE ON users FOR EACH ROW BEGIN UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_veterinarians_updated_at AFTER UPDATE ON veterinarians FOR EACH ROW BEGIN UPDATE veterinarians SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_tutors_updated_at AFTER UPDATE ON tutors FOR EACH ROW BEGIN UPDATE tutors SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_patients_updated_at AFTER UPDATE ON patients FOR EACH ROW BEGIN UPDATE patients SET updated_at = datetime('now') WHERE id = NEW.id; END;
CREATE TRIGGER IF NOT EXISTS update_prescriptions_updated_at AFTER UPDATE ON prescriptions FOR EACH ROW BEGIN UPDATE prescriptions SET updated_at = datetime('now') WHERE id = NEW.id; END;

-- Prevent deletion of prescriptions
CREATE TRIGGER IF NOT EXISTS prevent_prescription_deletion BEFORE DELETE ON prescriptions FOR EACH ROW BEGIN SELECT RAISE(ABORT, 'No se permite eliminar recetas emitidas. Use anulacion en su lugar.'); END;

-- Initial subscription plans
INSERT OR IGNORE INTO subscription_plans (id, nombre, precio_mensual, max_usuarios, max_recetas_mes, funcionalidades) VALUES
  ('plan-basico', 'basico', 19990, 3, 50, 'prescriptions,patients,tutors'),
  ('plan-profesional', 'profesional', 49990, 15, 500, 'prescriptions,patients,tutors,medicines,audit,custom_branding'),
  ('plan-enterprise', 'enterprise', 99990, -1, -1, 'prescriptions,patients,tutors,medicines,audit,custom_branding,api_access,firma_electronica,priority_support');