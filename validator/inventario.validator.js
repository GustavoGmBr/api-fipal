import { z } from 'zod';

export const inventarioSchema = z.object({
  historico_id: z.coerce.number(),
  nome: z.string().min(1, "O nome do item é obrigatório").max(255),
  
  // ✅ Novo campo: Descrição
  descricao: z.string().optional().nullable(),
  
  tipo: z.string().optional().nullable(),
  subtipo: z.string().optional().nullable(),
  
  quantidade: z.coerce.number().min(0, "A quantidade não pode ser negativa").default(0),
  itensId_item: z.coerce.number().optional().nullable() 
});

export const inventarioUpdateSchema = z.object({
  nome: z.string().max(255).optional(),
  
  // ✅ Novo campo: Descrição no Update
  descricao: z.string().optional().nullable(),
  
  tipo: z.string().optional().nullable(),
  subtipo: z.string().optional().nullable(),
  
  // Quantidade opcional para permitir atualizações parciais
  quantidade: z.coerce.number().min(0).optional()
});