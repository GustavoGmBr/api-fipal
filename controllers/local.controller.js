import prisma from '../lib/prisma.js';
import { localSchema } from '../validator/local.validator.js';
import ftpService from '../services/ftp.service.js';
import { ZodError } from 'zod';

const toJSON = (obj) => JSON.parse(JSON.stringify(obj, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
));

export default {
  // 🟢 CREATE
  async store(req, res) {
    try {
      const validatedData = localSchema.parse(req.body);
      if (req.file) {
        const url = await ftpService.uploadFile(req.file, 'locais', validatedData.nome);
        validatedData.imagem = url;
      }
      const local = await prisma.locais.create({ data: validatedData });
      res.status(201).json(toJSON(local));
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ message: 'Erro de validação', errors: error.errors });
      res.status(500).json({ message: 'Erro ao criar local.' });
    }
  },
  // ✅ ADICIONE/VERIFIQUE ESTE MÉTODO
  async show(req, res) {
    try {
      const { id } = req.params;
      const local = await prisma.locais.findUnique({
        where: { id: Number(id) }
      });

      if (!local) {
        return res.status(404).json({ message: 'Local não encontrado.' });
      }

      // Lembre-se de tratar o BigInt se o seu ID for desse tipo
      res.json(JSON.parse(JSON.stringify(local, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar local.' });
    }
  },
  // 🔵 READ (ALL)
  async index(req, res) {
    try {
      const locais = await prisma.locais.findMany({ orderBy: { nome: 'asc' } });
      res.json(toJSON(locais));
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar locais.' });
    }
  },

  // 🔴 DELETE (Onde estava o erro!)
  async destroy(req, res) {
    try {
      const { id } = req.params;
      await prisma.locais.delete({ where: { id: Number(id) } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao deletar local.' });
    }
  },

  // 🟡 UPDATE
  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = localSchema.parse(req.body);
      if (req.file) {
        const url = await ftpService.uploadFile(req.file, 'locais', validatedData.nome);
        validatedData.imagem = url;
      }
      const local = await prisma.locais.update({
        where: { id: Number(id) },
        data: validatedData
      });
      res.json(toJSON(local));
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar local.' });
    }
  }
};