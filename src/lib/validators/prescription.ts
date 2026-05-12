import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicine_id: z.string().min(1),
  nombre_medicamento: z.string().min(1, "Medicamento es requerido"),
  principio_activo: z.string().min(1),
  dosis: z.string().min(1, "Dosis es requerida"),
  frecuencia: z.string().min(1, "Frecuencia es requerida"),
  duracion: z.string().min(1, "Duración es requerida"),
  via_administracion: z.string().min(1, "Vía es requerida"),
  cantidad: z.number().min(1, "Cantidad debe ser mayor a 0"),
  indicaciones: z.string().min(1, "Indicaciones son requeridas"),
  advertencias: z.string().optional(),
  condicion_venta: z.string(),
  es_antimicrobiano: z.boolean().default(false),
});

export const prescriptionSchema = z.object({
  patient_id: z.string().min(1, "Paciente es requerido"),
  tutor_id: z.string().min(1, "Tutor es requerido"),
  veterinarian_id: z.string().min(1, "Médico veterinario es requerido"),
  diagnostico: z.string().min(1, "Diagnóstico es requerido"),
  tipo_receta: z.enum([
    "receta_simple",
    "receta_retenida",
    "receta_retenida_control_saldo",
    "receta_antimicrobiano",
  ]),
  observaciones_clinicas: z.string().optional(),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "Debe incluir al menos un medicamento"),
});

export type PrescriptionItemFormData = z.infer<typeof prescriptionItemSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;