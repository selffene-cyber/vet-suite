import { z } from "zod";

export const patientSchema = z.object({
  tutor_id: z.string().min(1, "Tutor es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  especie: z.string().min(1, "Especie es requerida"),
  raza: z.string().min(1, "Raza es requerida"),
  sexo: z.enum(["macho", "hembra", "desconocido"]),
  fecha_nacimiento: z.string().optional(),
  edad: z.string().optional(),
  peso: z.number().positive().optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  alergias: z.string().optional(),
  condiciones_relevantes: z.string().optional(),
  historial_resumen: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;