import { z } from 'zod';

const capituloSchema = z.object({
  livro_id: z.number().int(),
  parent_id: z.number().int().nullable().optional(),
  numero: z.number().int(),
  titulo: z.string().min(1, "O título é obrigatório"),
  
  // Validação do conteúdo da história
  conteudo_json: z.array(
    z.object({
      tipo: z.enum(['paragrafo', 'dialogo', 'pensamento', 'quebra_cena', 'citacao']),
      ordem: z.number().int(),
      personagem_id: z.number().int().nullable().optional(),
      sexo: z.string().optional(),
      conteudo: z.record(z.any()) // Aceita o objeto flexível (fala, tom, sentimento, etc)
    })
  ).nullable().optional(),

  personagens_participantes: z.any().optional(),
  itens_participantes: z.any().optional(),
  locais_participantes: z.any().optional(),
});

export default capituloSchema;