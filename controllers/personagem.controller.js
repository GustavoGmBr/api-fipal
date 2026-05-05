import { PrismaClient } from '@prisma/client';
import ftpService from '../services/ftp.service.js'; // ✅ Extensão .js obrigatória

const prisma = new PrismaClient();

const personagemController = {
  async listar(req, res) {
    try {
      console.log('📋 Listando personagens...');
      // ✅ Ajustado para 'personagens' conforme seu schema
      const personagens = await prisma.personagens.findMany({
        include: {
          historicos: {
            orderBy: { criado_em: 'desc' },
            take: 1,
            include: { raca: true }
          }
        },
        orderBy: { nome: 'asc' }
      });
      console.log(`✅ ${personagens.length} personagens listados.`);
      res.json(personagens);
    } catch (error) {
      console.error('❌ Erro ao listar personagens:', error);
      res.status(500).json({ error: 'Erro interno ao carregar lista' });
    }
  },

  async criar(req, res) {
    try {
      console.log('➕ Criando novo personagem...');
      const dados = req.body;
      const files = req.files;

      let urlCorpo = null;
      let urlRosto = null;

      if (files) {
        const nomeLimpo = dados.nome ? dados.nome.replace(/\s+/g, '_') : 'Personagem';
        if (files.corpo) {
          urlCorpo = await ftpService.uploadFile(files.corpo[0], 'personagens', `${nomeLimpo}_Corpo`);
        }
        if (files.rosto) {
          urlRosto = await ftpService.uploadFile(files.rosto[0], 'personagens', `${nomeLimpo}_Rosto`);
        }
      }

      const novoPersonagem = await prisma.personagens.create({
        data: {
          ...dados,
          imagemCorpo: urlCorpo, // ✅ Nome correto do campo no seu schema
          imagemRosto: urlRosto   // ✅ Nome correto do campo no seu schema
        }
      });

      console.log(`✅ Personagem criado com ID: ${novoPersonagem.id}`);
      res.status(201).json(novoPersonagem);
    } catch (error) {
      console.error('❌ Erro ao criar personagem:', error);
      res.status(400).json({ error: 'Erro ao criar personagem', detalhes: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      console.log(`🔍 Buscando personagem ID: ${id}...`);
      const personagem = await prisma.personagens.findUnique({
        where: { id: parseInt(id) },
        include: {
          historicos: {
            orderBy: { criado_em: 'desc' },
            take: 1,
            include: { raca: true }
          }
        }
      });

      if (!personagem) {
        console.log(`🚨 Personagem ID ${id} não encontrado.`);
        return res.status(404).json({ error: 'Não encontrado' });
      }

      res.json(personagem);
    } catch (error) {
      console.error('❌ Erro ao buscar personagem:', error);
      res.status(500).json({ error: 'Erro ao buscar detalhes' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const files = req.files;

      console.log(`✏️ Atualizando personagem ID: ${id}...`);

      const atual = await prisma.personagens.findUnique({ where: { id: parseInt(id) } });
      if (!atual) return res.status(404).json({ error: "Personagem não encontrado" });

      let urlCorpo = atual.imagemCorpo;
      let urlRosto = atual.imagemRosto;

      if (files) {
        const nomeLimpo = (dados.nome || atual.nome).replace(/\s+/g, '_');
        if (files.corpo) {
          urlCorpo = await ftpService.uploadFile(files.corpo[0], 'personagens', `${nomeLimpo}_Corpo`);
        }
        if (files.rosto) {
          urlRosto = await ftpService.uploadFile(files.rosto[0], 'personagens', `${nomeLimpo}_Rosto`);
        }
      }

      const atualizado = await prisma.personagens.update({
        where: { id: parseInt(id) },
        data: { 
          ...dados, 
          imagemCorpo: urlCorpo, 
          imagemRosto: urlRosto 
        }
      });

      console.log(`✅ Personagem ID ${id} atualizado.`);
      res.json(atualizado);
    } catch (error) {
      console.error('❌ Erro ao atualizar personagem:', error);
      res.status(400).json({ error: "Erro ao atualizar" });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deletando personagem ID: ${id}...`);
      await prisma.personagens.delete({ where: { id: parseInt(id) } });
      console.log(`✅ Personagem ID ${id} deletado.`);
      res.status(204).send();
    } catch (error) {
      console.error('❌ Erro ao deletar personagem:', error);
      res.status(400).json({ error: "Erro ao deletar" });
    }
  }
};

export default personagemController;