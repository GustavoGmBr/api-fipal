import { prisma } from '../lib/prisma.js';
import { livroSchema } from '../validator/livro.validator.js';
import { ZodError } from 'zod';

const livroController = {
  async index(req, res) {
    try {
      // Incluído 'saga' na listagem geral para facilitar a exibição
      const livros = await prisma.livros.findMany({
        include: { 
          saga: true 
        }
      });
      res.json(livros);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;
      const livroId = Number(id);
      
      const livro = await prisma.livros.findUnique({
        where: { id: livroId },
        include: { 
          capitulos: true,
          saga: true // Incluindo os detalhes da saga vinculada
        }
      });

      if (!livro) {
        return res.status(404).json({ message: 'Livro não encontrado' });
      }
      res.json(livro);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async store(req, res) {
    try {
      const data = livroSchema.parse(req.body);
      const livro = await prisma.livros.create({
        data,
        include: { saga: true } // Retorna o objeto criado com a saga inclusa
      });
      res.status(201).json(livro);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const livroId = Number(id);
      const data = livroSchema.parse(req.body);

      const livro = await prisma.livros.update({
        where: { id: livroId },
        data,
        include: { saga: true }
      });
      res.json(livro);
    } catch (error) {
      handleErrors(res, error);
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const livroId = Number(id);
      await prisma.livros.delete({
        where: { id: livroId }
      });
      res.status(204).send();
    } catch (error) {
      handleErrors(res, error);
    }
  }
};

// Função auxiliar para padronizar o tratamento de erros
function handleErrors(res, error) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
  } else if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Livro não encontrado' });
  }
  res.status(500).json({ message: 'Erro interno do servidor' });
}

export default livroController;