import { z } from "zod";

export const tutorSchema = z.object({
  nombre_completo: z.string().min(1, "Nombre es requerido"),
  rut: z.string().min(1, "RUT es requerido"),
  telefono: z.string().min(1, "Teléfono es requerido"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  direccion: z.string().min(1, "Dirección es requerida"),
  comuna: z.string().min(1, "Comuna es requerida"),
  region: z.string().min(1, "Región es requerida"),
  observaciones: z.string().optional(),
});

export type TutorFormData = z.infer<typeof tutorSchema>;