import { PrismaClient } from '@prisma/client';
import ftpService from '../services/ftp.service.js';

const prisma = new PrismaClient();

const personagemFormaController = {
  // Listar todas as formas de um personagem específico
  async listarPorPersonagem(req, res) {
    try {
      const { personagemId } = req.params;
      console.log(`📋 Listando formas do personagem ID: ${personagemId}...`);

      const formas = await prisma.personagem_forma.findMany({
        where: { personagem_id: parseInt(personagemId) },
        include: {
          livro: true,
          capitulo: true
        },
        orderBy: { criado_em: 'asc' }
      });

      res.json(formas);
    } catch (error) {
      console.error('❌ Erro ao listar formas:', error);
      res.status(500).json({ error: 'Erro interno ao carregar formas' });
    }
  },

  // Criar uma nova transformação
  async criar(req, res) {
    try {
      console.log('➕ Criando nova forma/transformação...');
      const dados = req.body; // Já validados e transformados pelo Zod no futuro
      const files = req.files;

      let urlCorpo = null;
      let urlRosto = null;

      if (files) {
        const nomeLimpo = dados.nome ? dados.nome.replace(/\s+/g, '_') : 'Forma';
        if (files.corpo) {
          urlCorpo = await ftpService.uploadFile(files.corpo[0], 'formas', `${nomeLimpo}_Corpo`);
        }
        if (files.rosto) {
          urlRosto = await ftpService.uploadFile(files.rosto[0], 'formas', `${nomeLimpo}_Rosto`);
        }
      }

      const novaForma = await prisma.personagem_forma.create({
        data: {
          personagem_id: parseInt(dados.personagem_id),
          livro_id: dados.livro_id ? parseInt(dados.livro_id) : null,
          capitulo_id: dados.capitulo_id ? parseInt(dados.capitulo_id) : null,
          nome: dados.nome,
          descricao: dados.descricao,
          bonusPC: dados.bonusPC ? parseFloat(dados.bonusPC) : 0.0,
          imagemCorpo: urlCorpo,
          imagemRosto: urlRosto
        }
      });

      console.log(`✅ Forma criada com ID: ${novaForma.id}`);
      res.status(201).json(novaForma);
    } catch (error) {
      console.error('❌ Erro ao criar forma:', error);
      res.status(400).json({ error: 'Erro ao criar forma', detalhes: error.message });
    }
  },

  // Atualizar uma transformação existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const files = req.files;

      console.log(`✏️ Atualizando forma ID: ${id}...`);

      const atual = await prisma.personagem_forma.findUnique({ where: { id: parseInt(id) } });
      if (!atual) return res.status(404).json({ error: "Forma não encontrada" });

      let urlCorpo = atual.imagemCorpo;
      let urlRosto = atual.imagemRosto;

      if (files) {
        const nomeLimpo = (dados.nome || atual.nome).replace(/\s+/g, '_');
        if (files.corpo) {
          urlCorpo = await ftpService.uploadFile(files.corpo[0], 'formas', `${nomeLimpo}_Corpo`);
        }
        if (files.rosto) {
          urlRosto = await ftpService.uploadFile(files.rosto[0], 'formas', `${nomeLimpo}_Rosto`);
        }
      }

      const atualizada = await prisma.personagem_forma.update({
        where: { id: parseInt(id) },
        data: {
          livro_id: dados.livro_id ? parseInt(dados.livro_id) : atual.livro_id,
          capitulo_id: dados.capitulo_id ? parseInt(dados.capitulo_id) : atual.capitulo_id,
          nome: dados.nome || atual.nome,
          descricao: dados.descricao ?? atual.descricao,
          bonusPC: dados.bonusPC ? parseFloat(dados.bonusPC) : atual.bonusPC,
          imagemCorpo: urlCorpo,
          imagemRosto: urlRosto
        }
      });

      console.log(`✅ Forma ID ${id} atualizada.`);
      res.json(atualizada);
    } catch (error) {
      console.error('❌ Erro ao atualizar forma:', error);
      res.status(400).json({ error: "Erro ao atualizar forma" });
    }
  },

  // Deletar uma transformação
  async deletar(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deletando forma ID: ${id}...`);
      await prisma.personagem_forma.delete({ where: { id: parseInt(id) } });
      console.log(`✅ Forma ID ${id} deletada.`);
      res.status(204).send();
    } catch (error) {
      console.error('❌ Erro ao deletar forma:', error);
      res.status(400).json({ error: "Erro ao deletar forma" });
    }
  }
};

export default personagemFormaController;