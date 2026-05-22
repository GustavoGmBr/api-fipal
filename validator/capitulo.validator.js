import { z } from 'zod';

const capituloSchema = z.object({
  livro_id: z.number().int({ message: "O ID do livro deve ser um número inteiro" }),
  parent_id: z.number().int().nullable().optional(),
  numero: z.number().int({ message: "O número do capítulo deve ser um inteiro" }),
  titulo: z.string().trim().min(1, "O título é obrigatório"),

  // Validação do conteúdo da história (blocos do editor)
  conteudo_json: z.array(
    z.object({
      tipo: z.enum(['paragrafo', 'dialogo', 'pensamento', 'quebra_cena', 'citacao', 'quebra-cena']),
      ordem: z.number().int(),
      
      // 🌟 CORREÇÃO 1: Mapear o ID do personagem e o Sexo na raiz do bloco (como o front-end lê)
      personagem_id: z.number().int().nullable().optional(), 
      sexo: z.string().trim().nullable().optional(), // Masculino, Feminino, Desconhecido
      
      // IDs dos personagens que aparecem especificamente NESTE bloco
      personagens_participantes: z.array(z.number().int()).nullable().optional(),
      
      // Estrutura do conteúdo do bloco
      conteudo: z.object({
        texto: z.string().optional(), // Opcional se for diálogo (usa fala)
        fala: z.string().optional(),  // Para o texto dito no diálogo
        
        // 🌟 CORREÇÃO 2: Aceitar o nome customizado/temporário aqui dentro ou na raiz se necessário
        personagem_nome: z.string().trim().nullable().optional(), 
        
        // Outros metadados flexíveis do bloco
        tom: z.string().nullable().optional(),
        sentimento: z.string().nullable().optional(),
        acaoPosFala: z.string().nullable().optional(),
      }).catchall(z.any()) // Impede que o Zod rejeite novos metadados enviados pelo editor
    }).catchall(z.any()) // Adicionado na raiz do bloco também por segurança
  ).nullable().optional(),

  // Listas globais de participantes do capítulo
  personagens_participantes: z.array(z.number().int()).nullable().optional(),
  itens_participantes: z.array(z.number().int()).nullable().optional(),
  locais_participantes: z.array(z.number().int()).nullable().optional(),
});

export default capituloSchema;