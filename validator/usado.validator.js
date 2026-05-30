import { z } from 'zod';

export const createUsadoSchema = z.object({
  marca: z.string().max(100),
  modelo: z.string().max(100),
  ano: z.number().int().positive(),
  cor: z.string().max(50),
  placa: z.string().max(10),
  km_atual: z.number().int().nonnegative(),
  combustivel: z.enum(['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'HIBRIDO', 'ELETRICO']),
  pintura_metalica: z.boolean().default(false),
  direcao: z.enum(['ELETRICA', 'HIDRAULICA', 'MANUAL']).optional(),
  teto_solar: z.boolean().default(false),
  ar_condicionado: z.boolean().default(false),
  trava_eletrica: z.boolean().default(false),
  retrovisor_eletrico: z.boolean().default(false),
  multimidia: z.boolean().default(false),
  alarme: z.boolean().default(false),
  rodas_liga_leve: z.boolean().default(false),
  valor_fipe: z.number().positive(),
  valor_venda: z.number().positive(),
  observacao: z.string().optional(),
  codigoFipe: z.string().max(20).optional(), // <-- Adicionado aqui (com um max seguro para o padrão da FIPE)
  pericia: z.string().max(500).optional(),
  fotos: z.array(z.string()).default([]),
  created_by: z.number().int().positive()
});

export const updateUsadoSchema = z.object({
  id_usado: z.number().int().positive(),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  ano: z.number().int().positive().optional(),
  cor: z.string().max(50).optional(),
  placa: z.string().max(10).optional(),
  km_atual: z.number().int().nonnegative().optional(),
  combustivel: z.enum(['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'HIBRIDO', 'ELETRICO']).optional(),
  pintura_metalica: z.boolean().optional(),
  direcao: z.enum(['ELETRICA', 'HIDRAULICA', 'MANUAL']).optional(),
  teto_solar: z.boolean().optional(),
  ar_condicionado: z.boolean().optional(),
  trava_eletrica: z.boolean().optional(),
  retrovisor_eletrico: z.boolean().optional(),
  multimidia: z.boolean().optional(),
  alarme: z.boolean().optional(),
  rodas_liga_leve: z.boolean().optional(),
  valor_fipe: z.number().positive().optional(),
  valor_venda: z.number().positive().optional(),
  observacao: z.string().optional(),
  codigoFipe: z.string().max(20).optional(), // <-- Adicionado aqui também
  pericia: z.string().max(500).optional(),
  fotos: z.array(z.string()).optional()
});