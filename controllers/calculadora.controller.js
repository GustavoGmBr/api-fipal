import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const calculadoraController = {

  // Retorna todas as raças com progressões e bônus
  async getDados(req, res) {
    try {
      const racas = await prisma.racas.findMany({
        include: {
          progressoes:   { orderBy: { ordem: 'asc' } },
          bonus_limites: true
        },
        orderBy: { nome: 'asc' }
      })
      res.status(200).json(racas)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados', details: error.message })
    }
  }
}