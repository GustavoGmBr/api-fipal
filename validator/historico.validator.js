import { z } from 'zod';

export const historicoSchema = z.object({
  personagem_id: z.coerce.number({ invalid_type_error: "ID do personagem inválido" }),
  raca_id: z.coerce.number({ invalid_type_error: "ID da raça inválido" }),

<<<<<<< HEAD
  livro_id: z.coerce.number().optional().nullable(),
  capitulo_id: z.coerce.number().optional().nullable(),

=======

  livro_id: z.coerce.number().optional().nullable(),
  capitulo_id: z.coerce.number().optional().nullable(),


>>>>>>> a2941f4100f53d89372aaee69166cf1ee233d248
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

  xpAtual: z.number().int().default(0),
  xpProximo: z.number().int().default(0),

  elementos: z.any().optional(),
  equipamento: z.any().optional(),

  // ✅ Novo campo: habilidades
  // Definido como array de objetos para manter um padrão no banco
  habilidades: z.array(
    z.object({
      nome: z.string().min(1, "O nome da habilidade é obrigatório"),
      descricao: z.string().min(1, "A descrição da habilidade é obrigatória")
    })
  ).optional().default([]),

  inventario: z.array(
    z.object({
      itensId_item: z.coerce.number(),
      nome: z.string(),
      tipo: z.string().optional().nullable(),
      subtipo: z.string().optional().nullable(),
      quantidade: z.coerce.number().min(0.01).default(1)
    })
  ).optional().default([])
});