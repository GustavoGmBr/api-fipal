const { z } = require('zod');

const createPedidoSchema = z.object({
  cod_comercial: z.string().max(200),
  cliente: z.string().max(200),
  tipo_veiculo: z.string().max(200),
  vendedor: z.string().max(200),
  valor_pedido: z.number().positive("O valor do pedido deve ser maior que zero"),
  doc_b2b: z.string().max(200).optional().nullable(),
  status: z.string().max(50).default('Aberto'),
  dias_pedido: z.number().int().default(0),
  id_categoria: z.number().int(),
  pd_ativo: z.boolean().default(true),
  dt_pedido: z.string().datetime().optional()
});

const updatePedidoSchema = z.object({
  cod_comercial: z.string().max(200).optional(),
  cliente: z.string().max(200).optional(),
  tipo_veiculo: z.string().max(200).optional(),
  vendedor: z.string().max(200).optional(),
  valor_pedido: z.number().positive().optional(),
  doc_b2b: z.string().max(200).optional().nullable(),
  status: z.string().max(50).optional(),
  dias_pedido: z.number().int().optional(),
  id_categoria: z.number().int().optional(),
  pd_ativo: z.boolean().optional(),
  dt_pedido: z.string().datetime().optional()
});

module.exports = { createPedidoSchema, updatePedidoSchema };