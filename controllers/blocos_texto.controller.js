import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const blocosTextoController = {
  async listarTodos(req, res) {
    try {
      const blocos = await prisma.blocos_texto.findMany({ orderBy: { ordem: 'asc' } })
      res.status(200).json(blocos)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar blocos', details: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const bloco = await prisma.blocos_texto.findUnique({
        where: { id: BigInt(req.params.id) }
      })
      if (!bloco) return res.status(404).json({ error: 'Bloco não encontrado' })
      res.status(200).json({ ...bloco, id: bloco.id.toString() }) // BigInt → String
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar bloco', details: error.message })
    }
  },

  async listarPorCapitulo(req, res) {
    try {
      const blocos = await prisma.blocos_texto.findMany({
        where: { capitulo_id: parseInt(req.params.capitulo_id) },
        orderBy: { ordem: 'asc' }
      })
      // Converte BigInt para String no retorno
      const resultado = blocos.map(b => ({ ...b, id: b.id.toString() }))
      res.status(200).json(resultado)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar blocos do capítulo', details: error.message })
    }
  },

  async criar(req, res) {
    try {
      const { capitulo_id, ordem, tipo, conteudo } = req.body
      const bloco = await prisma.blocos_texto.create({
        data: { capitulo_id: parseInt(capitulo_id), ordem: parseInt(ordem), tipo, conteudo }
      })
      res.status(201).json({ ...bloco, id: bloco.id.toString() })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar bloco', details: error.message })
    }
  },

  async atualizar(req, res) {
    try {
      const { ordem, tipo, conteudo } = req.body
      const bloco = await prisma.blocos_texto.update({
        where: { id: BigInt(req.params.id) },
        data: {
          ordem: ordem ? parseInt(ordem) : undefined,
          tipo,
          conteudo
        }
      })
      res.status(200).json({ ...bloco, id: bloco.id.toString() })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Bloco não encontrado' })
      res.status(500).json({ error: 'Erro ao atualizar bloco', details: error.message })
    }
  },

  async deletar(req, res) {
    try {
      await prisma.blocos_texto.delete({ where: { id: BigInt(req.params.id) } })
      res.status(200).json({ message: 'Bloco deletado com sucesso' })
    } catch (error) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Bloco não encontrado' })
      res.status(500).json({ error: 'Erro ao deletar bloco', details: error.message })
    }
  },

  async reordenar(req, res) {
    try {
      const { blocos } = req.body // [{ id, ordem }, ...]
      await Promise.all(
        blocos.map(item =>
          prisma.blocos_texto.update({
            where: { id: BigInt(item.id) },
            data: { ordem: parseInt(item.ordem) }
          })
        )
      )
      res.status(200).json({ message: 'Blocos reordenados com sucesso' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao reordenar blocos', details: error.message })
    }
  }
}