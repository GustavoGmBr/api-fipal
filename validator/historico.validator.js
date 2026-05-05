import { z } from 'zod';

export const historicoSchema = z.object({
  // Coerção obrigatória para IDs
  personagem_id: z.coerce.number({ invalid_type_error: "ID do personagem inválido" }),
  raca_id: z.coerce.number({ invalid_type_error: "ID da raça inválido" }),
  
  // Opcionais com coerção
  livro_id: z.coerce.number().optional().nullable(),
  capitulo_id: z.coerce.number().optional().nullable(),
  
  // Atributos numéricos
  subnivel: z.coerce.number().default(0),
  qtd_treino: z.coerce.number().default(0),
  ponto_combate: z.coerce.number().default(0),
  ponto_combateAetheris: z.coerce.number().default(0),

  // Strings
  idade: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  ranque: z.string().optional().nullable(),
  classificacao: z.string().optional().nullable(),
  classes: z.string().optional().nullable(),
  estilo_luta: z.string().optional().nullable(),
  maestria: z.string().optional().nullable(),

  // JSON
  elementos: z.any().optional(),
  equipamento: z.any().optional()
});