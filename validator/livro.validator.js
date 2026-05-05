import * as z from 'zod';

export const livroSchema = z.object({
  titulo: z.string().min(1),
  sinopse: z.string().optional(),
  data_publicacao: z.coerce.date().optional(),
  ordem_serie: z.coerce.number().int().optional(),
});