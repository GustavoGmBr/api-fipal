import { z } from 'zod';

export const createTradeinSchema = z.object({
  cliente: z.string().max(200),
  chassi: z.string().max(17),
  codigo: z.number().int().positive(),
  valor: z.number().positive(),
  data_tradein: z.string().datetime().optional()
}); 

export const updateTradeinSchema = z.object({
  id_tradein: z.number().int().positive(),
  cliente: z.string().max(200).optional(),
  chassi: z.string().max(17).optional(),
  codigo: z.number().int().positive().optional(),
  valor: z.number().positive().optional(),
  data_tradein: z.string().datetime().optional()
});