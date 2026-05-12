import { z } from "zod";

export const userInviteSchema = z.object({
  nombre_completo: z.string().min(1, "Nombre es requerido"),
  correo: z.string().email("Correo inválido"),
  telefono: z.string().optional(),
  cargo: z.string().optional(),
  rol: z.enum([
    "admin",
    "veterinarian",
    "assistant",
    "read_only",
    "auditor",
  ]),
});

export type UserInviteFormData = z.infer<typeof userInviteSchema>;