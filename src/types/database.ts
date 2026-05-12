export type UserRole =
  | "super_admin"
  | "admin"
  | "veterinarian"
  | "assistant"
  | "read_only"
  | "auditor";

export type CompanyStatus = "active" | "suspended" | "inactive";
export type UserStatus = "active" | "inactive" | "suspended";

export type SaleCondition =
  | "venta_libre"
  | "receta_simple"
  | "receta_retenida"
  | "receta_retenida_control_saldo"
  | "uso_restringido";

export type PrescriptionType =
  | "receta_simple"
  | "receta_retenida"
  | "receta_retenida_control_saldo"
  | "receta_antimicrobiano";

export type PrescriptionStatus =
  | "emitida"
  | "vigente"
  | "vencida"
  | "anulada"
  | "reemplazada";

export type SubscriptionPlan = "basico" | "profesional" | "enterprise";

export interface D1Result<T> {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export interface Company {
  id: string;
  raz_social: string;
  nombre_fantasia: string;
  rut: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono: string;
  correo_contacto: string;
  sitio_web: string | null;
  logo_url: string | null;
  timbre_url: string | null;
  nro_autorizacion_sanitaria: string | null;
  texto_legal_pie: string | null;
  plan: SubscriptionPlan;
  estado: CompanyStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  company_id: string;
  folio_inicial: number;
  prefijo_folio: string;
  dias_vigencia_receta_simple: number;
  dias_vigencia_receta_retenida: number;
  dias_vigencia_receta_control_saldo: number;
  modulos_activos: string;
  correo_remitente: string;
  firma_config: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string;
  nombre_completo: string;
  rut: string;
  correo: string;
  telefono: string | null;
  cargo: string | null;
  rol: UserRole;
  estado: UserStatus;
  requiere_cambio_password: number;
  auth_2fa_habilitada: number;
  ultimo_acceso: string | null;
  veterinarian_id: string | null;
  auth_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tutor {
  id: string;
  company_id: string;
  nombre_completo: string;
  rut: string;
  telefono: string;
  correo: string | null;
  direccion: string;
  comuna: string;
  region: string;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  company_id: string;
  tutor_id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fecha_nacimiento: string | null;
  edad: string | null;
  peso: number | null;
  color: string | null;
  microchip: string | null;
  foto_url: string | null;
  alergias: string | null;
  condiciones_relevantes: string | null;
  historial_resumen: string | null;
  created_at: string;
  updated_at: string;
}

export interface Veterinarian {
  id: string;
  company_id: string;
  user_id: string | null;
  nombre_completo: string;
  rut: string;
  nro_registro_profesional: string;
  especialidad: string | null;
  correo: string;
  telefono: string;
  firma_url: string | null;
  timbre_url: string | null;
  es_independiente: number;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  nombre_comercial: string;
  principio_activo: string;
  forma_farmaceutica: string;
  concentracion: string;
  laboratorio: string;
  registro_sag: string | null;
  especie_permitida: string | null;
  condicion_venta: SaleCondition;
  clasificacion_terapeutica: string | null;
  es_antimicrobiano: number;
  control_especial: number;
  created_at: string;
}

export interface Prescription {
  id: string;
  company_id: string;
  codigo_unico: string;
  folio: string;
  fecha_emision: string;
  hora_emision: string;
  tutor_id: string;
  patient_id: string;
  veterinarian_id: string;
  diagnostico: string;
  tipo_receta: PrescriptionType;
  observaciones_clinicas: string | null;
  fecha_vencimiento: string;
  firma_imagen_url: string | null;
  hash_sha256: string;
  codigo_qr: string;
  codigo_alfanumerico: string;
  estado: PrescriptionStatus;
  receta_reemplazo_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: string;
  nombre_medicamento: string;
  principio_activo: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via_administracion: string;
  cantidad: number;
  indicaciones: string;
  advertencias: string | null;
  condicion_venta: SaleCondition;
  es_antimicrobiano: number;
}

export interface VerificationLog {
  id: string;
  codigo_verificado: string;
  tipo_verificacion: string;
  ip_address: string;
  user_agent: string | null;
  resultado: string;
  prescription_id: string | null;
  verified_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string | null;
  user_rol: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  detalles: string | null;
  ip_address: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}