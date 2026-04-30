import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const listarTodos = async (req, res) => {
  try {
    const livros = await prisma.livros.findMany({
      orderBy: { titulo: 'asc' }
    });
    res.json(livros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar livros" });
  }
};