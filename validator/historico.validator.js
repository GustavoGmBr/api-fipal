import { z } from 'zod';

export const historicoSchema = z.object({
  personagem_id: z.coerce.number({ invalid_type_error: "ID do personagem inválido" }),
  raca_id: z.coerce.number({ invalid_type_error: "ID da raça inválido" }),

  livro_id: z.coerce.number().optional().nullable(),
  capitulo_id: z.coerce.number().optional().nullable(),

  subnivel: z.coerce.number().default(0),
  qtd_treino: z.coerce.number().default(0),
  ponto_combate: z.coerce.number().default(0),
  ponto_combateAetheris: z.coerce.number().default(0),

  idade: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  ranque: z.string().optional().nullable(),
  classificacao: z.string().optional().nullable(),
  classes: z.string().optional().nullable(),
  estilo_luta: z.string().optional().nullable(),
  maestria: z.string().optional().nullable(),
  nivel: z.number().int().default(1),
  
  // ✅ Alterado: De 'experiencia' para 'xpAtual' e 'xpProximo'
  xpAtual: z.number().int().default(0),
  xpProximo: z.number().int().default(0),

  elementos: z.any().optional(),
  equipamento: z.any().optional(),

  // ✅ Validando inventário conforme os campos do banco
  inventario: z.array(
    z.object({
      itensId_item: z.coerce.number(), // ID do item na tabela mestre
      nome: z.string(),                // Nome do item no momento do registro
      tipo: z.string().optional().nullable(),
      subtipo: z.string().optional().nullable(), // Adicionado subtipo
      quantidade: z.coerce.number().min(0.01).default(1)
    })
  ).optional().default([])
});