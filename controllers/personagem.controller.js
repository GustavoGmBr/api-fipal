import { PrismaClient } from '@prisma/client'

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

  // Cria personagem + primeira progressão
  async criar(req, res) {
    try {
      const { nome, ultimo_aparecimento, progressao } = req.body

      const personagem = await prisma.personagens.create({
        data: {
          nome,
          ultimo_aparecimento: ultimo_aparecimento ? parseInt(ultimo_aparecimento) : null,
          progressoes: progressao ? {
            create: {
              capitulo_id:   parseInt(progressao.capitulo_id),
              forma:         progressao.forma         || null,
              nivel:         progressao.nivel         || null,
              qtd_estrela:   parseInt(progressao.qtd_estrela)  || 1,
              bonus_treino:  parseFloat(progressao.bonus_treino) || 0,
              bonus_pc:      parseFloat(progressao.bonus_pc)     || 0,
              ponto_combate: parseFloat(progressao.ponto_combate) || 0,
              situacao:      progressao.situacao      || 'vivo'
            }
          } : undefined
        }
      })
      res.status(201).json(personagem)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar personagem', details: error.message })
    }
  },

  // Atualiza dados gerais do personagem
  async atualizar(req, res) {
    try {
      const { nome, ultimo_aparecimento } = req.body
      const personagem = await prisma.personagens.update({
        where: { id: parseInt(req.params.id) },
        data: {
          nome,
          ultimo_aparecimento: ultimo_aparecimento ? parseInt(ultimo_aparecimento) : null
        }
      })
      res.status(200).json(personagem)
    } catch (error) {
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