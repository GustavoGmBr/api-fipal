import prisma from '../lib/prisma.js';
import itemSchema from '../validator/item.validator.js';
import ftpService from '../services/ftp.service.js';
import { ZodError } from 'zod';

export default {
  async index(req, res) {
    try {
      // ✅ CORRIGIDO: 'createdAt' em vez de 'criado_em'
      const items = await prisma.itens.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(items);
    } catch (error) {
      console.error("❌ Erro ao listar itens:", error);
      res.status(500).json({ message: 'Falha ao buscar itens no arsenal.' });
    }
  },

  async show(req, res) {
    try {
      const id = Number(req.params.id);
      // ✅ CORRIGIDO: 'id_item' em vez de 'id'
      const item = await prisma.itens.findUnique({ 
        where: { id_item: id } 
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado na Matrix.' });
      }
      res.json(item);
    } catch (error) {
      console.error("❌ Erro ao buscar item:", error);
      res.status(500).json({ message: 'Erro ao buscar detalhes do item.' });
    }
  },

  async store(req, res) {
    try {
      const body = { ...req.body };

      // ✅ CORRIGIDO: 'listaHabilidades' conforme seu schema
      if (typeof body.listaHabilidades === 'string') body.listaHabilidades = JSON.parse(body.listaHabilidades);
      if (typeof body.usuarios === 'string') body.usuarios = JSON.parse(body.usuarios);

      const validatedData = itemSchema.parse(body);

      if (req.file) {
        const uploadResult = await ftpService.uploadFile(req.file);
        // ✅ CORRIGIDO: 'urlImagem' conforme seu schema
        validatedData.urlImagem = uploadResult.url; 
      }

      const item = await prisma.itens.create({ 
        data: validatedData 
      });

      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Erro de validação", 
          errors: error.errors 
        });
      }
      console.error("❌ Erro ao criar item:", error);
      res.status(500).json({ message: 'Falha ao forjar novo item.' });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const body = { ...req.body };

      // ✅ CORRIGIDO: 'id_item'
      const existingItem = await prisma.itens.findUnique({ where: { id_item: id } });
      if (!existingItem) {
        return res.status(404).json({ message: 'Item não existe.' });
      }

      if (typeof body.listaHabilidades === 'string') body.listaHabilidades = JSON.parse(body.listaHabilidades);
      if (typeof body.usuarios === 'string') body.usuarios = JSON.parse(body.usuarios);

      const validatedData = itemSchema.parse(body);

      if (req.file) {
        const uploadResult = await ftpService.uploadFile(req.file);
        validatedData.urlImagem = uploadResult.url;
      }

      const item = await prisma.itens.update({
        where: { id_item: id },
        data: validatedData,
      });

      res.json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Erro de validação", errors: error.errors });
      }
      console.error("❌ Erro ao atualizar item:", error);
      res.status(500).json({ message: 'Erro ao atualizar item.' });
    }
  },

  async destroy(req, res) {
    try {
      const id = Number(req.params.id);
      // ✅ CORRIGIDO: 'id_item'
      await prisma.itens.delete({ where: { id_item: id } });
      res.status(204).send();
    } catch (error) {
      console.error("❌ Erro ao deletar item:", error);
      res.status(500).json({ message: 'Erro ao deletar item.' });
    }
  },
};