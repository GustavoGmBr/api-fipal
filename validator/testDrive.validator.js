import { z } from 'zod';

export const createTestDriveSchema = z.object({
  marca: z.string().max(100),
  modelo: z.string().max(100),
  ano: z.number().int().positive(),
  cor: z.string().max(50),
  placa: z.string().max(10),
  chassi: z.string().max(17),
  renavam: z.string().max(20),
});

export const updateTestDriveSchema = z.object({
  id_testdrive: z.number().int().positive(),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  ano: z.number().int().positive().optional(),
  cor: z.string().max(50).optional(),
  placa: z.string().max(10).optional(),
  chassi: z.string().max(17).optional(),
  renavam: z.string().max(20).optional(),
});