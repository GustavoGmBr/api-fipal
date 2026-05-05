import prisma from '../lib/prisma.js';
import { historicoSchema } from '../validator/historico.validator.js';
import { ZodError } from 'zod';

const store = async (req, res) => {
  try {
    const data = historicoSchema.parse(req.body);
    const historico = await prisma.personagem_historico.create({ data });
    return res.status(201).json(historico);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.errors });
    }
    console.error("❌ Erro Prisma (store):", error);
    return res.status(500).json({ error: 'Erro interno ao criar histórico' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  try {
    const data = historicoSchema.parse(req.body);
    const historico = await prisma.personagem_historico.update({
      where: { id: Number(id) },
      data
    });
    return res.json(historico);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    console.error("❌ Erro Prisma (update):", error);
    return res.status(500).json({ error: 'Erro interno ao atualizar' });
  }
};

const show = async (req, res) => {
  const { id } = req.params;
  try {
    const historico = await prisma.personagem_historico.findUnique({
      where: { id: Number(id) },
      include: {
        raca: true,
        livro: true,
        capitulo: true
      }
    });
    if (!historico) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    return res.json(historico);
  } catch (error) {
    console.error("❌ Erro Prisma (show):", error);
    return res.status(500).json({ error: 'Erro interno ao buscar detalhes' });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.personagem_historico.delete({
      where: { id: Number(id) }
    });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    console.error("❌ Erro Prisma (destroy):", error);
    return res.status(500).json({ error: 'Erro interno ao deletar' });
  }
};

const timeline = async (req, res) => {
  const { personagemId } = req.params;
  try {
    const historicos = await prisma.personagem_historico.findMany({
      where: { 
        personagem_id: Number(personagemId) // ✅ CORRIGIDO: Nome do campo no schema.prisma
      },
      include: {
        raca: true,
        livro: { select: { titulo: true } },
        capitulo: { select: { numero: true, titulo: true } }
      },
      orderBy: { criado_em: 'desc' }
    });
    return res.json(historicos);
  } catch (error) {
    console.error("❌ Erro Prisma (timeline):", error);
    return res.status(500).json({ error: 'Erro interno ao carregar linha do tempo' });
  }
};

export default {
  store,
  update,
  show,
  destroy,
  timeline
};