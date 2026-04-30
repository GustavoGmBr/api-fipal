import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const listarPorLivro = async (req, res) => {
  try {
    const { livroId } = req.params;
    const capitulos = await prisma.capitulos.findMany({
      where: { livro_id: parseInt(livroId) },
      orderBy: { numero: 'asc' }
    });
    res.json(capitulos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar capítulos" });
  }
};