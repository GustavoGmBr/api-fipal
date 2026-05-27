import { z } from 'zod';

export const createUsuarioSchema = z.object({
  login: z.string().max(100),
  senha: z.string().max(255),
  nome: z.string().max(200).optional(),
  nivel_acesso: z.number().int().default(1),
  foto: z.string().max(500).optional(),
});

export const updateUsuarioSchema = z.object({
  id_usuario: z.number().int().positive(),
  login: z.string().max(100).optional(),
  senha: z.string().max(255).optional(),
  nome: z.string().max(200).optional(),
  nivel_acesso: z.number().int().optional(),
  foto: z.string().max(500).optional(),
});