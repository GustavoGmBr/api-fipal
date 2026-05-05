import { z } from 'zod';

export const sistemaSchema = z.object({
  nome: z.string().min(1),
  progressao: z.union([z.array(z.any()), z.record(z.any())]),
  limite_bonus: z.union([z.array(z.any()), z.record(z.any())]),
});