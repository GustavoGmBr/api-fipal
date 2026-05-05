import prisma from '../lib/prisma.js';
import { racaSchema } from '../validator/raca.validator.js'; 

const racaController = {
  async index(req, res) {
    try {
      const racas = await prisma.racas.findMany({
        include: { sistema: true }
      });
      res.json(racas);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async show(req, res) {
    try {
      const id = Number(req.params.id);
      const raca = await prisma.racas.findUnique({
        where: { id },
        include: { sistema: true }
      });
      if (!raca) {
        return res.status(404).json({ error: 'Raça não encontrada' });
      }
      res.json(raca);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Raça não encontrada' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async store(req, res) {
    try {
      const data = racaSchema.parse(req.body);
      const raca = await prisma.racas.create({
        data,
        include: { sistema: true }
      });
      res.status(201).json(raca);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const data = racaSchema.parse(req.body);
      const raca = await prisma.racas.update({
        where: { id },
        data,
        include: { sistema: true }
      });
      res.json(raca);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Raça não encontrada' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async destroy(req, res) {
    try {
      const id = Number(req.params.id);
      await prisma.racas.delete({
        where: { id }
      });
      res.status(204).send();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Raça não encontrada' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export default racaController;
