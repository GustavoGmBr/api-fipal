import { z } from 'zod';

export const personagemSchema = z.object({
  nome: z.string().min(1).max(30),
  titulo: z.string().optional(),
  classe: z.string().optional(),
  afiliacao: z.string().optional(),
  altura: z.string().optional(),
  peso: z.string().optional(),
  tipo_corporal: z.string().optional(),
  tipo_cabelo: z.string().optional(),
  cor_cabelo: z.string().optional(),
  olhos: z.string().optional(),
  olhos_especiais: z.string().optional(),
  tom_voz: z.string().optional(),
  traje_combate: z.string().optional(),
  traje_casual: z.string().optional(),
  armamento_principal: z.string().optional(),
  virtude: z.string().optional(),
  defeito: z.string().optional(),
  temperamento: z.string().optional()
});