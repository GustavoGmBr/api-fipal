import { z } from 'zod';

const itemValidator = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  urlImagem: z.string().optional(),
  // ✅ Nova estrutura: Array de Objetos
  listaHabilidades: z.array(
    z.object({
      nome: z.string().min(1, "Nome da habilidade é obrigatório"),
      descricao: z.string().min(1, "Descrição da habilidade é obrigatória")
    })
  ).optional(),
  // ✅ Usuários continuam como array de strings (nomes)
  usuarios: z.array(z.string()).optional(),
  aparencia: z.string().optional(),
  descricao: z.string().optional(),
});

export default itemValidator;