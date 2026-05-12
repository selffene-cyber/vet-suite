-- PiwiSuite Vet - Esquema de base de datos
-- PostgreSQL / Supabase con RLS para multi-tenancy
-- Cumple normativa chilena: Decreto N°25/2005, Ley 19.799, Ley 19.628

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'veterinarian', 'assistant', 'read_only', 'auditor');
CREATE TYPE company_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE sale_condition AS ENUM ('venta_libre', 'receta_simple', 'receta_retenida', 'receta_retenida_control_saldo', 'uso_restringido');
CREATE TYPE prescription_type AS ENUM ('receta_simple', 'receta_retenida', 'receta_retenida_control_saldo', 'receta_antimicrobiano');
CREATE TYPE prescription_status AS ENUM ('emitida', 'vigente', 'vencida', 'anulada', 'reemplazada');
CREATE TYPE signature_type AS ENUM ('firma', 'timbre', 'logo');
CREATE TYPE entity_type AS ENUM ('company', 'veterinarian');
CREATE TYPE firma_config_type AS ENUM ('imagen', 'firma_electronica');
CREATE TYPE subscription_plan AS ENUM ('basico', 'profesional', 'enterprise');

-- ============================================
-- COMPANIES
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  plan subscription_plan NOT NULL DEFAULT 'basico',
  estado company_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_rut ON companies(rut);
CREATE INDEX idx_companies_estado ON companies(estado);

-- ============================================
-- COMPANY SETTINGS
-- ============================================

CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  folio_inicial INTEGER NOT NULL DEFAULT 1,
  prefijo_folio TEXT NOT NULL DEFAULT 'REC-',
  dias_vigencia_receta_simple INTEGER NOT NULL DEFAULT 30,
  dias_vigencia_receta_retenida INTEGER NOT NULL DEFAULT 30,
  dias_vigencia_receta_control_saldo INTEGER NOT NULL DEFAULT 90,
  modulos_activos TEXT[] NOT NULL DEFAULT ARRAY['prescriptions', 'patients', 'tutors', 'medicines']::TEXT[],
  correo_remitente TEXT NOT NULL,
  firma_config firma_config_type NOT NULL DEFAULT 'imagen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL,
  correo TEXT NOT NULL,
  telefono TEXT,
  cargo TEXT,
  rol user_role NOT NULL DEFAULT 'assistant',
  estado user_status NOT NULL DEFAULT 'active',
  requiere_cambio_password BOOLEAN NOT NULL DEFAULT true,
  auth_2fa_habilitada BOOLEAN NOT NULL DEFAULT false,
  ultimo_acceso TIMESTAMPTZ,
  veterinarian_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, correo),
  UNIQUE(company_id, rut)
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_users_estado ON users(estado);

-- ============================================
-- VETERINARIANS
-- ============================================

CREATE TABLE veterinarians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL,
  nro_registro_profesional TEXT NOT NULL,
  especialidad TEXT,
  correo TEXT NOT NULL,
  telefono TEXT NOT NULL,
  firma_url TEXT,
  timbre_url TEXT,
  es_independiente BOOLEAN NOT NULL DEFAULT false,
  estado user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, rut),
  UNIQUE(company_id, nro_registro_profesional)
);

CREATE INDEX idx_veterinarians_company ON veterinarians(company_id);
CREATE INDEX idx_veterinarians_user ON veterinarians(user_id);

-- Update users.veterinarian_id FK
ALTER TABLE users ADD CONSTRAINT fk_users_veterinarian
  FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL;

-- ============================================
-- TUTORS
-- ============================================

CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT,
  direccion TEXT NOT NULL,
  comuna TEXT NOT NULL,
  region TEXT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, rut)
);

CREATE INDEX idx_tutors_company ON tutors(company_id);
CREATE INDEX idx_tutors_nombre ON tutors USING gin(nombre_completo gin_trgm_ops);
CREATE INDEX idx_tutors_rut ON tutors(rut);

-- ============================================
-- PATIENTS
-- ============================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  especie TEXT NOT NULL,
  raza TEXT NOT NULL,
  sexo TEXT NOT NULL DEFAULT 'desconocido',
  fecha_nacimiento DATE,
  edad TEXT,
  peso NUMERIC(6,2),
  color TEXT,
  microchip TEXT,
  foto_url TEXT,
  alergias TEXT,
  condiciones_relevantes TEXT,
  historial_resumen TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_company ON patients(company_id);
CREATE INDEX idx_patients_tutor ON patients(tutor_id);
CREATE INDEX idx_patients_nombre ON patients USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_patients_especie ON patients(especie);

-- ============================================
-- MEDICINES
-- ============================================

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_comercial TEXT NOT NULL,
  principio_activo TEXT NOT NULL,
  forma_farmaceutica TEXT NOT NULL,
  concentracion TEXT NOT NULL,
  laboratorio TEXT NOT NULL,
  registro_sag TEXT,
  especie_permitida TEXT,
  condicion_venta sale_condition NOT NULL DEFAULT 'venta_libre',
  clasificacion_terapeutica TEXT,
  es_antimicrobiano BOOLEAN NOT NULL DEFAULT false,
  control_especial BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medicines_nombre ON medicines USING gin(nombre_comercial gin_trgm_ops);
CREATE INDEX idx_medicines_principio ON medicines USING gin(principio_activo gin_trgm_ops);
CREATE INDEX idx_medicines_condicion ON medicines(condicion_venta);
CREATE INDEX idx_medicines_antimicrobiano ON medicines(es_antimicrobiano);
CREATE INDEX idx_medicines_sag ON medicines(registro_sag);

-- ============================================
-- COMPANY MEDICINES
-- ============================================

CREATE TABLE company_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, medicine_id)
);

CREATE INDEX idx_company_medicines_company ON company_medicines(company_id);

-- ============================================
-- PRESCRIPTIONS
-- ============================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  codigo_unico TEXT NOT NULL UNIQUE,
  folio TEXT NOT NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_emision TIME NOT NULL DEFAULT LOCALTIME,
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  veterinarian_id UUID NOT NULL REFERENCES veterinarians(id) ON DELETE RESTRICT,
  diagnostico TEXT NOT NULL,
  tipo_receta prescription_type NOT NULL DEFAULT 'receta_simple',
  observaciones_clinicas TEXT,
  fecha_vencimiento DATE NOT NULL,
  firma_imagen_url TEXT,
  hash_sha256 TEXT NOT NULL,
  codigo_qr TEXT NOT NULL,
  codigo_alfanumerico TEXT NOT NULL UNIQUE,
  estado prescription_status NOT NULL DEFAULT 'emitida',
  receta_reemplazo_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prescriptions_company ON prescriptions(company_id);
CREATE INDEX idx_prescriptions_folio ON prescriptions(folio);
CREATE INDEX idx_prescriptions_codigo ON prescriptions(codigo_unico);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_tutor ON prescriptions(tutor_id);
CREATE INDEX idx_prescriptions_vet ON prescriptions(veterinarian_id);
CREATE INDEX idx_prescriptions_estado ON prescriptions(estado);
CREATE INDEX idx_prescriptions_fecha ON prescriptions(fecha_emision);
CREATE INDEX idx_prescriptions_tipo ON prescriptions(tipo_receta);

-- ============================================
-- PRESCRIPTION ITEMS
-- ============================================

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
  nombre_medicamento TEXT NOT NULL,
  principio_activo TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  duracion TEXT NOT NULL,
  via_administracion TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  indicaciones TEXT NOT NULL,
  advertencias TEXT,
  condicion_venta sale_condition NOT NULL,
  es_antimicrobiano BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine ON prescription_items(medicine_id);

-- ============================================
-- PRESCRIPTION PDF FILES
-- ============================================

CREATE TABLE prescription_pdf_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  pdf_size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prescription_id)
);

-- ============================================
-- VERIFICATION LOGS
-- ============================================

CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_verificado TEXT NOT NULL,
  tipo_verificacion TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  resultado TEXT NOT NULL,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_logs_codigo ON verification_logs(codigo_verificado);
CREATE INDEX idx_verification_logs_prescription ON verification_logs(prescription_id);
CREATE INDEX idx_verification_logs_fecha ON verification_logs(verified_at);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  user_rol user_role,
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  entidad_id UUID,
  detalles JSONB,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entidad ON audit_logs(entidad);
CREATE INDEX idx_audit_logs_fecha ON audit_logs(created_at);

-- ============================================
-- UPLOADED SIGNATURES
-- ============================================

CREATE TABLE uploaded_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  url TEXT NOT NULL,
  tipo signature_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signatures_company ON uploaded_signatures(company_id);
CREATE INDEX idx_signatures_entity ON uploaded_signatures(entity_type, entity_id);

-- ============================================
-- SUBSCRIPTION PLANS
-- ============================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre subscription_plan NOT NULL UNIQUE,
  precio_mensual NUMERIC(10,2) NOT NULL,
  max_usuarios INTEGER NOT NULL,
  max_recetas_mes INTEGER NOT NULL,
  funcionalidades TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

INSERT INTO subscription_plans (nombre, precio_mensual, max_usuarios, max_recetas_mes, funcionalidades) VALUES
  ('basico', 19990, 3, 50, ARRAY['prescriptions', 'patients', 'tutors']::TEXT[]),
  ('profesional', 49990, 15, 500, ARRAY['prescriptions', 'patients', 'tutors', 'medicines', 'audit', 'custom_branding']::TEXT[]),
  ('enterprise', 99990, -1, -1, ARRAY['prescriptions', 'patients', 'tutors', 'medicines', 'audit', 'custom_branding', 'api_access', 'firma_electronica', 'priority_support']::TEXT[]);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_pdf_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies: cada tabla con company_id usa aislamiento por tenant

CREATE POLICY "companies_isolation" ON companies
  FOR ALL USING (id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "company_settings_isolation" ON company_settings
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "users_isolation" ON users
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "veterinarians_isolation" ON veterinarians
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "tutors_isolation" ON tutors
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "patients_isolation" ON patients
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "company_medicines_isolation" ON company_medicines
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "prescriptions_isolation" ON prescriptions
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "prescription_items_isolation" ON prescription_items
  FOR ALL USING (prescription_id IN (SELECT id FROM prescriptions WHERE company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY "prescription_pdf_isolation" ON prescription_pdf_files
  FOR ALL USING (prescription_id IN (SELECT id FROM prescriptions WHERE company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY "audit_logs_isolation" ON audit_logs
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "uploaded_signatures_isolation" ON uploaded_signatures
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

-- Verification logs are public-read (for the verification portal)
CREATE POLICY "verification_logs_public_read" ON verification_logs
  FOR SELECT USING (true);

-- Medicines catalog is public-read
CREATE POLICY "medicines_public_read" ON medicines
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON veterinarians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tutors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update prescription status based on expiry
CREATE OR REPLACE FUNCTION check_prescription_expiry()
RETURNS void AS $$
BEGIN
  UPDATE prescriptions
  SET estado = 'vencida'
  WHERE estado IN ('emitida', 'vigente')
    AND fecha_vencimiento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: prevent prescription deletion
-- ============================================

CREATE OR REPLACE FUNCTION prevent_prescription_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'No se permite eliminar recetas emitidas. Use la anulación en su lugar.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_prescription_delete
  BEFORE DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION prevent_prescription_deletion();

-- ============================================
-- TRIGGER: prevent prescription_items deletion if prescription not annulled
-- ============================================

CREATE OR REPLACE FUNCTION prevent_item_modification()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    v_estado prescription_status;
  BEGIN
    SELECT estado INTO v_estado FROM prescriptions WHERE id = NEW.prescription_id;
    IF v_estado NOT IN ('emitida', 'vigente') THEN
      RAISE EXCEPTION 'No se pueden modificar items de una receta que no está en estado emitida o vigente.';
    END IF;
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Enable pg_trgm for full-text search
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;