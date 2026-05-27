import { z } from 'zod';

// Schema para Login
export const loginSchema = z.object({
  login: z.string({ required_error: "O login é obrigatório." }).trim(),
  senha: z.string({ required_error: "A senha é obrigatória." })
});

// Schema para Cadastro de novos usuários
export const createUsuarioSchema = z.object({
  login: z
    .string({ required_error: "O login é obrigatório." })
    .min(3, "O login deve ter pelo menos 3 caracteres.")
    .max(100)
    .trim(),
  senha: z
    .string({ required_error: "A senha é obrigatória." })
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  nivel_acesso: z
    .number()
    .int()
    .min(1, "Nível mínimo é 1")
    .optional() // Se não enviado, o Prisma usará o padrão 1 do banco
});

// Schema para Edição de usuários (campos opcionais)
export const updateUsuarioSchema = z.object({
  login: z.string().min(3).max(100).trim().optional(),
  senha: z.string().min(6).optional(),
  nivel_acesso: z.number().int().min(1).optional()
});