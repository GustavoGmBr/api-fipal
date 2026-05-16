import { z } from 'zod';

export const livroSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(255),
  sinopse: z.string().optional().nullable(),
  // Coerce converte a string do input date para objeto Date automaticamente
  data_publicacao: z.coerce.date().optional().nullable(),
  // Adicionado nullable para aceitar o 'null' enviado pelo front ao limpar campos
  ordem_serie: z.coerce.number().int().optional().nullable(),
  saga_id: z.coerce.number().int().optional().nullable(),
});