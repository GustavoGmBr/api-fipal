import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const livrosController = {
  async listarTodos(req, res) {
    try {
      const livros = await prisma.livros.findMany({
        include: { capitulos: true },
        orderBy: { ordem_serie: 'asc' }
      })
      res.status(200).json(livros)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar livros', details: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const livro = await prisma.livros.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          capitulos: {
            include: { blocos_texto: { orderBy: { ordem: 'asc' } } },
            orderBy: { numero: 'asc' }
          }
        }
      })
      if (!livro) return res.status(404).json({ error: 'Livro não encontrado' })
      res.status(200).json(livro)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar livro', details: error.message })
    }
  },

  async criar(req, res) {
    try {
      const { titulo, sinopse, data_publicacao, ordem_serie } = req.body
      const livro = await prisma.livros.create({
        data: {
          titulo,
          sinopse,
          data_publicacao: data_publicacao ? new Date(data_publicacao) : null,
          ordem_serie
        }
      })
      res.status(201).json(livro)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar livro', details: error.message })
    }
  },

  async atualizar(req, res) {
    try {
      const { titulo, sinopse, data_publicacao, ordem_serie } = req.body
      const livro = await prisma.livros.update({
        where: { id: parseInt(req.params.id) },
        data: {
          titulo,
          sinopse,
          data_publicacao: data_publicacao ? new Date(data_publicacao) : undefined,
          ordem_serie
        }
      })
      res.status(200).json(livro)
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Livro não encontrado' })
      res.status(500).json({ error: 'Erro ao atualizar livro', details: error.message })
    }
  },

  async deletar(req, res) {
    try {
      await prisma.livros.delete({ where: { id: parseInt(req.params.id) } })
      res.status(200).json({ message: 'Livro deletado com sucesso' })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Livro não encontrado' })
      res.status(500).json({ error: 'Erro ao deletar livro', details: error.message })
    }
  }
}