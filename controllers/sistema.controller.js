import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar todos os sistemas (RETORNO COMPLETO PARA A CALCULADORA)
export const listarTodos = async (req, res) => {
  try {
    const todosSistemas = await prisma.sistemas.findMany({
      orderBy: { nome: 'asc' }
      // O 'select' foi removido para trazer progressao e limite_bonus
    });
    res.json(todosSistemas);
  } catch (error) {
    console.error("❌ Erro no Prisma (listarTodos Sistemas):", error);
    res.status(500).json({ error: "Erro interno ao buscar sistemas", detalhes: error.message });
  }
};

// Buscar sistema por ID
export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const sistema = await prisma.sistemas.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!sistema) return res.status(404).json({ error: "Sistema não encontrado" });
    
    res.json(sistema);
  } catch (error) {
    console.error("❌ Erro no Prisma (buscarPorId Sistema):", error);
    res.status(500).json({ error: "Erro ao buscar sistema" });
  }
};

// Criar novo sistema
export const criar = async (req, res) => {
  try {
    const { nome, progressao, limite_bonus } = req.body;
    const novoSistema = await prisma.sistemas.create({
      data: { nome, progressao, limite_bonus }
    });
    res.status(201).json(novoSistema);
  } catch (error) {
    console.error("❌ Erro no Prisma (criar Sistema):", error);
    res.status(400).json({ error: "Erro ao criar sistema", detalhes: error.message });
  }
};

// Atualizar sistema
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, progressao, limite_bonus } = req.body;
    const sistemaAtualizado = await prisma.sistemas.update({
      where: { id: parseInt(id) },
      data: { nome, progressao, limite_bonus }
    });
    res.json(sistemaAtualizado);
  } catch (error) {
    console.error("❌ Erro no Prisma (atualizar Sistema):", error);
    res.status(400).json({ error: "Erro ao atualizar sistema" });
  }
};

// Deletar sistema
export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sistemas.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("❌ Erro no Prisma (deletar Sistema):", error);
    res.status(400).json({ error: "Erro ao deletar sistema" });
  }
};