import { z } from 'zod';

const personagemFormaSchema = z.object({
  personagem_id: z.string().transform((val) => parseInt(val, 10)),
  livro_id: z.string().optional().transform((val) => val ? parseInt(val, 10) : null),
  capitulo_id: z.string().optional().transform((val) => val ? parseInt(val, 10) : null),
  
  nome: z.string().min(2, "O nome da forma é obrigatório"),
  descricao: z.string().optional(),
  
  // Transforma a string recebida em Float (Ex: "15.5" -> 15.5)
  bonusPC: z.string().default("0").transform((val) => parseFloat(val)),
});

export { personagemFormaSchema };