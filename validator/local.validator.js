// server/validator/local.validator.js
import { z } from 'zod';

export const localSchema = z.object({
  nome: z.string().min(1, "Nome do local é obrigatório"),
  mundo: z.string().min(1, "Mundo é obrigatório"),
  descricao: z.string().optional(),
  imagem: z.string().optional()
});