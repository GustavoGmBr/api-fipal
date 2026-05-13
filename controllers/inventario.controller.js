import prisma from '../lib/prisma.js';
import { inventarioSchema, inventarioUpdateSchema } from '../validator/inventario.validator.js';
import { ZodError } from 'zod';

const inventarioController = {
  async index(req, res) {
    try {
      const { historicoId } = req.query;
      const items = await prisma.inventarios.findMany({
        where: historicoId ? { historico_id: Number(historicoId) } : {},
        orderBy: { nome: 'asc' }
      });
      res.json(items);
    } catch (error) {
      handleErrors(res, error, "index");
    }
  },

  async store(req, res) {
    try {
      const data = inventarioSchema.parse(req.body);

      // ✅ Agora a busca considera também o subtipo para acumular
      const itemExistente = await prisma.inventarios.findFirst({
        where: {
          historico_id: data.historico_id,
          nome: data.nome,
          tipo: data.tipo,
          subtipo: data.subtipo // Garante que "Arma: Espada" não some com "Arma: Machado"
        }
      });

      if (itemExistente) {
        const novaQuantidade = Number(itemExistente.quantidade) + data.quantidade;
        const atualizado = await prisma.inventarios.update({
          where: { id: itemExistente.id },
          data: { quantidade: novaQuantidade }
        });
        return res.json(atualizado);
      }

      const novoItem = await prisma.inventarios.create({
        data
      });

      res.status(201).json(novoItem);
    } catch (error) {
      handleErrors(res, error, "store");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = inventarioUpdateSchema.parse(req.body);

      const itemInventario = await prisma.inventarios.update({
        where: { id: Number(id) },
        data
      });

      res.json(itemInventario);
    } catch (error) {
      handleErrors(res, error, "update");
    }
  },
  async updateDinheiro(req, res) {
    try {
      const { id } = req.params;
      const { operacao, valor } = req.body; // operacao: 'somar' ou 'subtrair'

      // 1. Busca o item para validar se é Moeda
      const itemExistente = await prisma.inventarios.findUnique({
        where: { id: Number(id) }
      });

      if (!itemExistente) {
        return res.status(404).json({ error: 'Moeda não encontrada no inventário' });
      }

      if (itemExistente.tipo !== 'Moeda') {
        return res.status(400).json({ error: 'Este item não é do tipo Moeda' });
      }

      // 2. Calcula o novo valor
      let novaQuantidade = Number(itemExistente.quantidade);
      const valorAlteracao = Number(valor);

      if (operacao === 'somar') {
        novaQuantidade += valorAlteracao;
      } else if (operacao === 'subtrair') {
        if (novaQuantidade < valorAlteracao) {
          return res.status(400).json({ error: 'Saldo de moedas insuficiente' });
        }
        novaQuantidade -= valorAlteracao;
      } else {
        return res.status(400).json({ error: 'Operação inválida. Use somar ou subtrair' });
      }

      // 3. Atualiza no banco
      const atualizado = await prisma.inventarios.update({
        where: { id: Number(id) },
        data: { quantidade: novaQuantidade }
      });

      res.json(atualizado);
    } catch (error) {
      handleErrors(res, error, "updateDinheiro");
    }
  },
  async show(req, res) {
    try {
      const { id } = req.params;
      const itemId = Number(id);

      // Verificação de segurança caso o ID não seja um número
      if (isNaN(itemId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const item = await prisma.inventarios.findUnique({
        where: { id: itemId },
        include: {
          historico: true, // Traz os dados do personagem dono do item
          itens: true      // Traz os detalhes do item base (se houver vínculo)
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Registro no inventário não encontrado' });
      }

      res.json(item);
    } catch (error) {
      handleErrors(res, error, "show");
    }
  },
  async destroy(req, res) {
    try {
      const { id } = req.params;
      await prisma.inventarios.delete({
        where: { id: Number(id) }
      });
      res.status(204).send();
    } catch (error) {
      handleErrors(res, error, "destroy");
    }
  }
};

function handleErrors(res, error, context) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Dados inválidos", detalhes: error.errors });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Registro no inventário não encontrado' });
  }
  console.error(`❌ Erro Prisma (Inventário - ${context}):`, error);
  return res.status(500).json({ error: 'Erro interno no servidor' });
}

export default inventarioController;