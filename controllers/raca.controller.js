import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Criar nova raça
export const criar = async (req, res) => {
  try {
    const { nome, base, limite, mundo, sistema_id } = req.body;

    if (!sistema_id) {
      return res.status(400).json({ error: "O campo sistema_id é obrigatório." });
    }

    const novaRaca = await prisma.racas.create({
      data: { 
        nome,
        base: parseInt(base), 
        limite: parseInt(limite),
        mundo: mundo || "Geral",
        sistema_id: parseInt(sistema_id) 
      },
      include: {
        sistema: true
      }
    });

    res.status(201).json(novaRaca);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar raça", detalhes: error.message });
  }
};

// Listar todas as raças
export const listarTodos = async (req, res) => {
  try {
    const todas = await prisma.racas.findMany({
      include: { sistema: true },
      orderBy: { nome: 'asc' }
    });
    res.json(todas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar raças" });
  }
};

// Buscar raça por ID (ESTA FUNÇÃO ESTAVA FALTANDO)
export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const raca = await prisma.racas.findUnique({
      where: { id: parseInt(id) },
      include: { sistema: true }
    });
    
    if (!raca) return res.status(404).json({ error: "Raça não encontrada" });
    
    res.json(raca);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar raça" });
  }
};

// Atualizar raça
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, base, limite, mundo, sistema_id } = req.body;

    const racaAtualizada = await prisma.racas.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        base: base ? parseInt(base) : undefined,
        limite: limite ? parseInt(limite) : undefined,
        mundo,
        sistema_id: sistema_id ? parseInt(sistema_id) : undefined
      },
      include: { sistema: true }
    });

    res.json(racaAtualizada);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar raça", detalhes: error.message });
  }
};

// Deletar raça
export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.racas.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar raça" });
  }
};