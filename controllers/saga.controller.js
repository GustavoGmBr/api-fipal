import { prisma } from '../lib/prisma.js';
import { sagaSchema } from '../validator/saga.validator.js'; // Lembre-se de criar este arquivo
import { ZodError } from 'zod';

const sagaController = {
  async index(req, res) {
    try {
      const sagas = await prisma.sagas.findMany({
        include: {
          _count: {
            select: { livros: true } // Mostra a quantidade de livros em cada saga
          }
        }
      });
      res.json(sagas);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;
      const sagaId = Number(id);

      const saga = await prisma.sagas.findUnique({
        where: { id: sagaId },
        include: {
          livros: {
            orderBy: { ordem_serie: 'asc' } // Lista os livros da saga em ordem
          }
        }
      });

      if (!saga) {
        return res.status(404).json({ message: 'Saga não encontrada' });
      }
      res.json(saga);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async store(req, res) {
    try {
      const data = sagaSchema.parse(req.body);
      const saga = await prisma.sagas.create({
        data
      });
      res.status(201).json(saga);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const sagaId = Number(id);
      const data = sagaSchema.parse(req.body);

      const saga = await prisma.sagas.update({
        where: { id: sagaId },
        data
      });
      res.json(saga);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const sagaId = Number(id);

      await prisma.sagas.delete({
        where: { id: sagaId }
      });
      res.status(204).send();
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

// Função de erro padronizada conforme seu modelo
function handleErrors(res, error) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
  } else if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Saga não encontrada' });
  }
  res.status(500).json({ message: 'Erro interno do servidor' });
}

export default sagaController;