const { z } = require('zod');

const createCategoriaPedidoSchema = z.object({
  cod_categoria: z.number().int().positive(),
  desc_categoria: z.string().min(1, 'A descrição é obrigatória')
});

const updateCategoriaPedidoSchema = z.object({
  id_categoria: z.number().int().positive(),
  cod_categoria: z.number().int().positive().optional(),
  desc_categoria: z.string().min(1).optional()
});

module.exports = {
  createCategoriaPedidoSchema,
  updateCategoriaPedidoSchema
};