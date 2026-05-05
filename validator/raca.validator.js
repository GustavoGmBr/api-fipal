import { z } from 'zod';

export const racaSchema = z.object({
  nome: z.string().min(1),
  base: z.coerce.number(),
  limite: z.coerce.number(),
  mundo: z.string().default('Geral').optional(),
  sistema_id: z.coerce.number(),
});