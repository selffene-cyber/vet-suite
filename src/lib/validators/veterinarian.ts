import { z } from "zod";

export const veterinarianSchema = z.object({
  nombre_completo: z.string().min(1, "Nombre es requerido"),
  rut: z.string().min(1, "RUT es requerido"),
  nro_registro_profesional: z.string().min(1, "N° registro es requerido"),
  especialidad: z.string().optional(),
  correo: z.string().email("Correo inválido"),
  telefono: z.string().min(1, "Teléfono es requerido"),
  es_independiente: z.boolean().default(false),
});

export type VeterinarianFormData = z.infer<typeof veterinarianSchema>;