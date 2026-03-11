import { PrismaClient } from '@prisma/client'
import ftpService from '../services/ftp.service.js'

const prisma = new PrismaClient()

export const personagemController = {

  // Lista todos os personagens com última progressão
  async listarTodos(req, res) {
    try {
      const personagens = await prisma.personagens.findMany({
        include: {
          progressoes: {
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

  // Busca um personagem com toda a progressão
  async buscarPorId(req, res) {
    try {
      const personagem = await prisma.personagens.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          progressoes: {
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

  // Cria personagem + primeira progressão + Upload de Imagens
  async criar(req, res) {
    try {
      const { nome, ultimo_aparecimento, progressao } = req.body

      let urlImagemRosto = null;
      let urlImagemFull = null;

      // 1. Tratamento do Upload via FTP
      if (req.files) {
        if (req.files.imagem_rosto && req.files.imagem_rosto.length > 0) {
          urlImagemRosto = await ftpService.uploadFile(req.files.imagem_rosto[0], 'public/personagens/rosto');
        }
        if (req.files.imagem_full && req.files.imagem_full.length > 0) {
          urlImagemFull = await ftpService.uploadFile(req.files.imagem_full[0], 'public/personagens/full');
        }
      }

      // 2. Tratamento do FormData (transforma string JSON de volta em Objeto)
      let progressaoParsed = progressao;
      if (typeof progressao === 'string') {
        try {
          progressaoParsed = JSON.parse(progressao);
        } catch (e) {
          console.error("Erro ao fazer parse da progressão", e);
        }
      }

      const personagem = await prisma.personagens.create({
        data: {
          nome,
          ultimo_aparecimento: ultimo_aparecimento ? parseInt(ultimo_aparecimento) : null,
          // CORREÇÃO: Usando os nomes exatos do schema.prisma
          imagemRosto: urlImagemRosto, 
          imagemCorpo: urlImagemFull,  
          progressoes: progressaoParsed ? {
            create: {
              capitulo_id:   parseInt(progressaoParsed.capitulo_id),
              forma:         progressaoParsed.forma         || null,
              nivel:         progressaoParsed.nivel         || null,
              qtd_estrela:   parseInt(progressaoParsed.qtd_estrela)  || 1,
              bonus_treino:  parseFloat(progressaoParsed.bonus_treino) || 0,
              bonus_pc:      parseFloat(progressaoParsed.bonus_pc)     || 0,
              ponto_combate: parseFloat(progressaoParsed.ponto_combate) || 0,
              situacao:      progressaoParsed.situacao      || 'vivo'
            }
          } : undefined
        }
      })
      res.status(201).json(personagem)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar personagem', details: error.message })
    }
  },

  // Atualiza dados gerais do personagem + Upload de Imagens
  async atualizar(req, res) {
    try {
      const { nome, ultimo_aparecimento } = req.body

      // Prepara o objeto de atualização
      const dataUpdate = {
        nome,
        ultimo_aparecimento: ultimo_aparecimento ? parseInt(ultimo_aparecimento) : null
      }

      // Verifica se vieram novas imagens na requisição de atualização
      if (req.files) {
        if (req.files.imagem_rosto && req.files.imagem_rosto.length > 0) {
          // CORREÇÃO: Usando imagemRosto
          dataUpdate.imagemRosto = await ftpService.uploadFile(req.files.imagem_rosto[0], 'public/personagens/rosto');
        }
        if (req.files.imagem_full && req.files.imagem_full.length > 0) {
          // CORREÇÃO: Usando imagemCorpo
          dataUpdate.imagemCorpo = await ftpService.uploadFile(req.files.imagem_full[0], 'public/personagens/full');
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

  // Deleta personagem (progressões deletadas em cascade)
  async deletar(req, res) {
    try {
      await prisma.personagens.delete({ where: { id: parseInt(req.params.id) } })
      res.status(200).json({ message: 'Personagem deletado com sucesso' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar personagem', details: error.message })
    }
  },

  // Adiciona progressão de um capítulo
  async adicionarProgressao(req, res) {
    try {
      const { capitulo_id, forma, nivel, qtd_estrela, bonus_treino, bonus_pc, ponto_combate, situacao } = req.body
      const progressao = await prisma.personagem_progressao.upsert({
        where: {
          personagem_id_capitulo_id: {
            personagem_id: parseInt(req.params.id),
            capitulo_id:   parseInt(capitulo_id)
          }
        },
        update: { forma, nivel, qtd_estrela, bonus_treino, bonus_pc, ponto_combate, situacao },
        create: {
          personagem_id: parseInt(req.params.id),
          capitulo_id:   parseInt(capitulo_id),
          forma, nivel, qtd_estrela, bonus_treino, bonus_pc, ponto_combate, situacao
        }
      })
      res.status(200).json(progressao)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao salvar progressão', details: error.message })
    }
  },

  // Compara dois personagens
  async comparar(req, res) {
    try {
      const { id1, id2 } = req.query
      const [p1, p2] = await Promise.all([
        prisma.personagens.findUnique({
          where: { id: parseInt(id1) },
          include: {
            progressoes: {
              orderBy: { capitulo_id: 'asc' },
              include: { capitulo: true }
            }
          }
        }),
        prisma.personagens.findUnique({
          where: { id: parseInt(id2) },
          include: {
            progressoes: {
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