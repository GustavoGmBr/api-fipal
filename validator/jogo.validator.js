import { z } from 'zod';

// Schema interno para validar a estrutura de cada item dentro do JSON de estatísticas
const estatisticaJogoItemSchema = z.object({
  tipo_jogo: z.string().min(1).max(100),
  total_ganho: z.number().nonnegative(),
  total_perdido: z.number().nonnegative(),
});

export const createJogoSchema = z.object({
  id_usuario: z.number().int().positive(),
  valor_moedas: z.number().nonnegative().default(0),
  valor_total_ganho: z.number().nonnegative().default(0),
  valor_total_perdido: z.number().nonnegative().default(0),
  vezes_resetadas: z.number().int().nonnegative().default(0),
  // Valida se é um array com a estrutura correta do JSON
  estatisticas_jogos: z.array(estatisticaJogoItemSchema),
});

export const updateJogoSchema = z.object({
  id_jogo: z.number().int().positive().optional(),
  id_usuario: z.number().int().positive().optional(),
  valor_moedas: z.number().nonnegative().optional(),
  valor_total_ganho: z.number().nonnegative().optional(),
  valor_total_perdido: z.number().nonnegative().optional(),
  vezes_resetadas: z.number().int().nonnegative().optional(),
  // Permite atualizar as estatísticas parciais ou completas do JSON
  estatisticas_jogos: z.array(estatisticaJogoItemSchema).optional(),
});

export const queryFiltrosJogoSchema = z.object({
  id_usuario: z.number().int().positive().optional(),
  // Filtros para buscar quem tem moedas ou resets acima de um valor específico
  min_moedas: z.coerce.number().nonnegative().optional(),
  max_moedas: z.coerce.number().nonnegative().optional(),
  vezes_resetadas: z.coerce.number().int().nonnegative().optional(),
  // Filtro por tipo de jogo específico dentro do JSON (caso faça a busca na aplicação)
  tipo_jogo: z.string().optional(),
});