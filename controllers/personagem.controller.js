import { PrismaClient } from '@prisma/client'
import ftpService from '../services/ftp.service.js'

const prisma = new PrismaClient()

// Função auxiliar para limpar strings (tira acentos e espaços)
const limparTexto = (str) => {
  if (!str) return 'Base';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
};

export const personagemController = {

  // ─── DADOS BÁSICOS DO PERSONAGEM 

  // Lista todos os personagens com última progressão de ranque
  async listarTodos(req, res) {
    try {
      const personagens = await prisma.personagens.findMany({
        include: {
          raca: true,
          ranques: {
            orderBy: { capitulo_id: 'desc' },
            take: 1,
            include: { capitulo: true }
          }
        },
        orderBy: { nome: 'asc' }
      })
      res.status(200).json(personagens)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar personagens', details: error.message })
    }
  },

  // Busca um personagem com todo o histórico de ranque
  async buscarPorId(req, res) {
    try {
      const personagem = await prisma.personagens.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          raca: true,
          ranques: {
            orderBy: { capitulo_id: 'asc' },
            include: { capitulo: { include: { livros: true } } }
          }
        }
      })
      if (!personagem) return res.status(404).json({ error: 'Personagem não encontrado' })
      res.status(200).json(personagem)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar personagem', details: error.message })
    }
  },

  // Cria apenas os dados base do personagem + Upload de Imagens
  async criar(req, res) {
    try {
      const { nome, titulo, classe, raca_id } = req.body

      const nomeLimpo = limparTexto(nome);
      let urlImagemRosto = null;
      let urlImagemFull = null;

      // Tratamento do Upload via FTP
      if (req.files) {
        if (req.files.imagem_rosto && req.files.imagem_rosto.length > 0) {
          urlImagemRosto = await ftpService.uploadFile(req.files.imagem_rosto[0], 'public/personagens/rosto', `${nomeLimpo}_Rosto`);
        }
        if (req.files.imagem_full && req.files.imagem_full.length > 0) {
          urlImagemFull = await ftpService.uploadFile(req.files.imagem_full[0], 'public/personagens/full', `${nomeLimpo}_Full`);
        }
      }

      const personagem = await prisma.personagens.create({
        data: {
          nome,
          titulo: titulo || null,
          classe: classe || null,
          raca_id: raca_id ? parseInt(raca_id) : null,
          imagemRosto: urlImagemRosto, 
          imagemCorpo: urlImagemFull
        }
      })
      res.status(201).json(personagem)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar personagem', details: error.message })
    }
  },

  // Atualiza dados base do personagem + Upload de Imagens
  async atualizar(req, res) {
    try {
      const { nome, titulo, classe, raca_id } = req.body

      const dataUpdate = {
        nome,
        titulo: titulo || null,
        classe: classe || null,
        raca_id: raca_id ? parseInt(raca_id) : null,
        atualizado_em: new Date()
      }

      const nomeLimpo = limparTexto(nome);

      // Verifica se vieram novas imagens
      if (req.files) {
        if (req.files.imagem_rosto && req.files.imagem_rosto.length > 0) {
          dataUpdate.imagemRosto = await ftpService.uploadFile(req.files.imagem_rosto[0], 'public/personagens/rosto', `${nomeLimpo}_Rosto`);
        }
        if (req.files.imagem_full && req.files.imagem_full.length > 0) {
          dataUpdate.imagemCorpo = await ftpService.uploadFile(req.files.imagem_full[0], 'public/personagens/full', `${nomeLimpo}_Full`);
        }
      }

      const personagem = await prisma.personagens.update({
        where: { id: parseInt(req.params.id) },
        data: dataUpdate
      })
      res.status(200).json(personagem)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar personagem', details: error.message })
    }
  },

  // Deleta personagem (progressões deletadas em cascade pelo Prisma/BD)
  async deletar(req, res) {
    try {
      await prisma.personagens.delete({ where: { id: parseInt(req.params.id) } })
      res.status(200).json({ message: 'Personagem deletado com sucesso' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar personagem', details: error.message })
    }
  },

  // ─── PROGRESSÃO DE RANQUE 

  // Calcula o PC e salva a progressão de ranque
  async adicionarProgressaoRanque(req, res) {
    try {
      const personagem_id = parseInt(req.params.id);
      const { capitulo_id, forma, ranque, estrela, bonus_treino, bonus_pc } = req.body;

      // 1. Busca o personagem e a raça para pegar a Base e o Limite
      const personagem = await prisma.personagens.findUnique({
        where: { id: personagem_id },
        include: { raca: true }
      });

      if (!personagem || !personagem.raca) {
        return res.status(400).json({ error: 'Personagem não encontrado ou sem raça definida.' });
      }

      const raca = personagem.raca;
      const isDemonio = raca.nome === "Demônios";

      // 2. Tabelas de Progressão (Regras de Negócio)
      const progressaoPadrao = {
        "Inferior": [1, 10], "Comum": [10, 20], "Incomum": [20, 50],
        "Avançado": [50, 100], "Superior": [100, 150], "Lendário": [150, 300],
        "Divino": [300, 320], "Místico": [320, 400], "Celestial": [400, 600],
        "Transcendente": [600, 650], "Guardião": [650, 1000], "Criador": [1000, 1000]
      };

      const progressaoDemonios = {
        "Inferior": [50, 100], "Bestial": [100, 200], "Combatente": [200, 350],
        "Oculta": [350, 500], "Superior": [500, 700], "Desastre": [600, 900],
        "Primordial": [900, 1500]
      };

      const limiteBonusPadrao = {
        "Inferior": 50, "Comum": 50, "Incomum": 80, "Avançado": 100, "Superior": 150, 
        "Lendário": 200, "Divino": 300, "Místico": 400, "Celestial": 500,
        "Transcendente": 1000, "Guardião": 9999, "Criador": 9999
      };

      // 3. Cálculos do PC
      const treinoInput = parseFloat(bonus_treino) || 0;
      const treinoFinal = Math.min(treinoInput, raca.limite);
      const baseTotal = raca.base + treinoFinal;

      const tabelaUsada = isDemonio ? progressaoDemonios : progressaoPadrao;
      const infoRanque = tabelaUsada[ranque];

      if (!infoRanque) return res.status(400).json({ error: 'Ranque inválido para esta raça.' });

      const multAtual = infoRanque[0];
      const multProximo = infoRanque[1];
      const diferenca = multProximo - multAtual;

      const progressoEstrela = { "1": 0.00, "2": 0.25, "3": 0.50, "4": 0.75, "5": 1.00 };
      const pctEstrela = isDemonio ? 0 : progressoEstrela[String(estrela || 1)];
      const multFinal = multAtual + (diferenca * pctEstrela);

      const extraInput = parseFloat(bonus_pc) || 0;
      const maxBonus = isDemonio ? 999999 : limiteBonusPadrao[ranque];
      const extraFinal = Math.min(extraInput, maxBonus);

      const pcTotal = baseTotal * multFinal * (1 + (extraFinal / 100));

      // 4. Salva no banco (Verifica se já existe progressão neste capítulo)
      const existe = await prisma.personagem_ranque.findFirst({
        where: { personagem_id, capitulo_id: parseInt(capitulo_id) }
      });

      let resultado;
      if (existe) {
        resultado = await prisma.personagem_ranque.update({
          where: { id: existe.id },
          data: { 
            forma: forma || null, 
            ranque, 
            estrela: parseInt(estrela || 1), 
            bonus_treino: treinoFinal, 
            bonus_pc: extraFinal, 
            pc_total: pcTotal 
          }
        });
      } else {
        resultado = await prisma.personagem_ranque.create({
          data: {
            personagem_id, 
            capitulo_id: parseInt(capitulo_id),
            forma: forma || null, 
            ranque, 
            estrela: parseInt(estrela || 1), 
            bonus_treino: treinoFinal, 
            bonus_pc: extraFinal, 
            pc_total: pcTotal
          }
        });
      }

      res.status(200).json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao salvar progressão', details: error.message });
    }
  },

  // Deleta uma progressão de ranque específica
  async deletarProgressaoRanque(req, res) {
    try {
      const { progressaoId } = req.params;
      await prisma.personagem_ranque.delete({
        where: { id: parseInt(progressaoId) }
      });
      res.status(200).json({ message: 'Progressão deletada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar progressão', details: error.message });
    }
  },

  // ─── COMPARAÇÃO 

  // Compara dois personagens (Atualizado para usar a tabela ranques)
  async comparar(req, res) {
    try {
      const { id1, id2 } = req.query
      const [p1, p2] = await Promise.all([
        prisma.personagens.findUnique({
          where: { id: parseInt(id1) },
          include: {
            raca: true,
            ranques: {
              orderBy: { capitulo_id: 'asc' },
              include: { capitulo: true }
            }
          }
        }),
        prisma.personagens.findUnique({
          where: { id: parseInt(id2) },
          include: {
            raca: true,
            ranques: {
              orderBy: { capitulo_id: 'asc' },
              include: { capitulo: true }
            }
          }
        })
      ])
      res.status(200).json({ p1, p2 })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao comparar personagens', details: error.message })
    }
  }
}