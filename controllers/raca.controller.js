import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const racaController = {
  async listar(req, res) {
    try {
      const racas = await prisma.racas.findMany({
        orderBy: { nome: 'asc' }
      })
      res.status(200).json(racas)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar raças', details: error.message })
    }
  }
}