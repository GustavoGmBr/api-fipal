import { z } from 'zod';

const setoresPermitidos = z.enum(["NOVOS", "ADM", "OFICINA", "USADOS", "PECAS"]);

export const createDespesaSchema = z.object({
  descricao: z.string().max(255).optional().nullable(),
  prestador: z.string().min(1).max(150),
  valor: z.number().positive(),
  setor: setoresPermitidos,
  data_despesa: z.coerce.date(),
});

export const updateDespesaSchema = z.object({
  id_despesa: z.number().int().positive().optional(),
  descricao: z.string().max(255).optional().nullable(),
  prestador: z.string().min(1).max(150).optional(),
  valor: z.number().positive().optional(),
  setor: setoresPermitidos.optional(),
  data_despesa: z.coerce.date().optional(),
});

export const queryFiltrosSchema = z.object({
  prestador: z.string().optional(),
  descricao: z.string().optional(),
  setor: setoresPermitidos.optional(),
  // Filtros de Data (Período)
  data_inicio: z.coerce.date().optional(),
  data_fim: z.coerce.date().optional(),
  // Parâmetros para filtros específicos e comparativos
  mes_base: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  // Filtro para comparação baseada no dia atual (ex: até dia 02)
  comparar_dia_atual: z.preprocess((val) => val === 'true', z.boolean()).optional(),
});