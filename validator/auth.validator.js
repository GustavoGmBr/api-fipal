import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  login: z.string().min(6, "Login deve ter no mínimo 6 caracteres"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  nivel_acesso: z.number()
});

export const atualizarUsuarioSchema = z.object({
  login: z.string().min(6, "Login deve ter no mínimo 6 caracteres").optional(),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").optional(),
  nivel_acesso: z.number().optional()
});

export const loginSchema = z.object({
  login: z.string().min(6, "Login deve ter no mínimo 6 caracteres"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
});