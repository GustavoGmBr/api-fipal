import { z } from 'zod';

export const sagaSchema = z.object({
  nome: z.string().min(1, "O nome da saga é obrigatório").max(255),
  descricao: z.string().optional().nullable(),
});