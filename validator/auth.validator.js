import { z } from 'zod';

export const loginSchema = z.object({
  login: z
    .string({ required_error: "O login é obrigatório." })
    .min(3, "O login deve ter pelo menos 3 caracteres.")
    .max(25, "O login não pode passar de 100 caracteres.")
    .trim(),
  senha: z
    .string({ required_error: "A senha é obrigatória." })
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(12)
});