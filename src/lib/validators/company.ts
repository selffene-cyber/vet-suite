import { z } from "zod";

export const companySchema = z.object({
  raz_social: z.string().min(1, "Razón social es requerida"),
  nombre_fantasia: z.string().min(1, "Nombre de fantasía es requerido"),
  rut: z
    .string()
    .min(1, "RUT es requerido")
    .refine((val) => {
      const clean = val.replace(/[^0-9kK]/g, "");
      if (clean.length < 2) return false;
      const body = clean.slice(0, -1);
      const dv = clean.slice(-1).toUpperCase();
      let sum = 0;
      let multiplier = 2;
      for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
      }
      const expectedDv = 11 - (sum % 11);
      const dvChar =
        expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();
      return dv === dvChar;
    }, "RUT inválido"),
  direccion: z.string().min(1, "Dirección es requerida"),
  comuna: z.string().min(1, "Comuna es requerida"),
  region: z.string().min(1, "Región es requerida"),
  telefono: z.string().min(1, "Teléfono es requerido"),
  correo_contacto: z.string().email("Correo inválido"),
  sitio_web: z.string().url().optional().or(z.literal("")),
  nro_autorizacion_sanitaria: z.string().optional(),
  texto_legal_pie: z.string().optional(),
});

export const companySettingsSchema = z.object({
  folio_inicial: z.number().min(1, "Folio inicial debe ser mayor a 0"),
  prefijo_folio: z.string().min(1, "Prefijo de folio es requerido"),
  dias_vigencia_receta_simple: z.number().min(1).max(365),
  dias_vigencia_receta_retenida: z.number().min(1).max(365),
  dias_vigencia_receta_control_saldo: z.number().min(1).max(365),
  correo_remitente: z.string().email("Correo remitente inválido"),
  firma_config: z.enum(["imagen", "firma_electronica"]),
});

export type CompanyFormData = z.infer<typeof companySchema>;
export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;