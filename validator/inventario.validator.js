import { z } from 'zod';

export const inventarioSchema = z.object({
  historico_id: z.coerce.number(),
  nome: z.string().min(1, "O nome do item é obrigatório").max(255),
  tipo: z.string().optional().nullable(),
  subtipo: z.string().optional().nullable(), // ✅ Novo campo
  quantidade: z.coerce.number().min(0, "A quantidade não pode ser negativa").default(0),
  itensId_item: z.coerce.number().optional().nullable() // Referência opcional à tabela de itens
});

export const inventarioUpdateSchema = z.object({
  nome: z.string().optional(),
  tipo: z.string().optional().nullable(),
  subtipo: z.string().optional().nullable(), // ✅ Novo campo
  quantidade: z.coerce.number().min(0)
});