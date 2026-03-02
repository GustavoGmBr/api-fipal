import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const capitulosController = {
  async listarTodos(req, res) {
    try {
      const capitulos = await prisma.capitulos.findMany({
        include: { blocos_texto: { orderBy: { ordem: 'asc' } } },
        orderBy: { numero: 'asc' }
      })
      res.status(200).json(capitulos)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar capítulos', details: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const capitulo = await prisma.capitulos.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { blocos_texto: { orderBy: { ordem: 'asc' } } }
      })
      if (!capitulo) return res.status(404).json({ error: 'Capítulo não encontrado' })
      res.status(200).json(capitulo)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar capítulo', details: error.message })
    }
  },

  async listarPorLivro(req, res) {
    try {
      const capitulos = await prisma.capitulos.findMany({
        where: { livro_id: parseInt(req.params.livro_id) },
        include: { blocos_texto: { orderBy: { ordem: 'asc' } } },
        orderBy: { numero: 'asc' }
      })
      res.status(200).json(capitulos)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar capítulos do livro', details: error.message })
    }
  },

  async criar(req, res) {
    try {
      const { livro_id, numero, titulo } = req.body
      const capitulo = await prisma.capitulos.create({
        data: { livro_id: parseInt(livro_id), numero: parseInt(numero), titulo }
      })
      res.status(201).json(capitulo)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar capítulo', details: error.message })
    }
  },

  async atualizar(req, res) {
    try {
      const { livro_id, numero, titulo } = req.body
      const capitulo = await prisma.capitulos.update({
        where: { id: parseInt(req.params.id) },
        data: {
          livro_id: livro_id ? parseInt(livro_id) : undefined,
          numero: numero ? parseInt(numero) : undefined,
          titulo
        }
      })
      res.status(200).json(capitulo)
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Capítulo não encontrado' })
      res.status(500).json({ error: 'Erro ao atualizar capítulo', details: error.message })
    }
  },

  async deletar(req, res) {
    try {
      await prisma.capitulos.delete({ where: { id: parseInt(req.params.id) } })
      res.status(200).json({ message: 'Capítulo deletado com sucesso' })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Capítulo não encontrado' })
      res.status(500).json({ error: 'Erro ao deletar capítulo', details: error.message })
    }
  }
}