import { PrismaClient } from '@prisma/client'
import ftpService from '../services/ftp.service.js'

const prisma = new PrismaClient()

const limparTexto = (str) => {
  if (!str) return 'Base';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
};

export const personagemController = {

  // ─── DADOS BÁSICOS DO PERSONAGEM ───

  async listarTodos(req, res) {
    try {
      const personagens = await prisma.personagens.findMany({
        include: {
          racas: true,
          personagem_ranque: {
            orderBy: { capitulo_id: 'desc' },
            take: 1,
            include: { capitulos: true }
          }
        },
        orderBy: { nome: 'asc' }
      })
      res.status(200).json(personagens)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar personagens', details: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const personagem = await prisma.personagens.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          racas: true,
          personagem_ranque: {
            orderBy: { capitulo_id: 'asc' },
            // ⚠️ CORREÇÃO: Removido o include de "livros" que estava causando o Erro 500
            include: { capitulos: true } 
          }
        }
      })
      if (!personagem) return res.status(404).json({ error: 'Personagem não encontrado' })
      res.status(200).json(personagem)
    } catch (error) {
      console.error("Erro no buscarPorId:", error);
      res.status(500).json({ error: 'Erro ao buscar personagem', details: error.message })
    }
  },

  async criar(req, res) {
    try {
      const { nome, titulo, classe, raca_id } = req.body

      const nomeLimpo = limparTexto(nome);
      let urlImagemRosto = null;
      let urlImagemFull = null;

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

  async deletar(req, res) {
    try {
      await prisma.personagens.delete({ where: { id: parseInt(req.params.id) } })
      res.status(200).json({ message: 'Personagem deletado com sucesso' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar personagem', details: error.message })
    }
  },

  // ─── PROGRESSÃO DE RANQUE ───

  async adicionarProgressaoRanque(req, res) {
    try {
      const personagem_id = parseInt(req.params.id);
      const { capitulo_id, forma, ranque, estrela, bonus_treino, bonus_pc } = req.body;

      const personagem = await prisma.personagens.findUnique({
        where: { id: personagem_id },
        include: { racas: true }
      });

      if (!personagem || !personagem.racas) {
        return res.status(400).json({ error: 'Personagem não encontrado ou sem raça definida.' });
      }

      const raca = personagem.racas;
      const isDemonio = raca.nome === "Demônios";

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

      const treinoInput = parseInt(bonus_treino) || 0;
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

      const pcTotal = Math.round(baseTotal * multFinal * (1 + (extraFinal / 100)));

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
  }
}