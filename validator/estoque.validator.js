import { z } from 'zod';

// Esquema para criação de um novo item no Estoque
export const createEstoqueSchema = z.object({
  referencia: z.string().min(1).max(100), // Ajuste o max de acordo com sua necessidade
  descricao: z.string().min(1), // Como é TEXT no banco, aceita strings longas
  localizacao: z.string().max(150).optional().nullable(),
  estoqueFisico: z.number().int().nonnegative().default(0),
  estoqueSistema: z.number().int().nonnegative().default(0),
});

// Esquema para atualização de um item existente no Estoque
export const updateEstoqueSchema = z.object({
  id: z.number().int().positive().optional(), // Geralmente vem na URL, mas mantemos aqui se necessário
  referencia: z.string().min(1).max(100).optional(),
  descricao: z.string().min(1).optional(),
  localizacao: z.string().max(150).optional().nullable(),
  estoqueFisico: z.number().int().nonnegative().optional(),
  estoqueSistema: z.number().int().nonnegative().optional(),
});

// Esquema para filtros e buscas de Estoque
export const queryEstoqueFiltrosSchema = z.object({
  referencia: z.string().optional(),
  descricao: z.string().optional(),
  localizacao: z.string().optional(),
  
  // Filtros avançados para encontrar divergências entre físico e sistema
  comDivergencia: z.preprocess((val) => val === 'true', z.boolean()).optional(),
  
  // Filtros de data baseados na criação ou última modificação
  data_inicio: z.coerce.date().optional(),
  data_fim: z.coerce.date().optional(),
});