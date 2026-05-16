import prisma from '../lib/prisma.js';
import { inventarioSchema, inventarioUpdateSchema } from '../validator/inventario.validator.js';
import { ZodError } from 'zod';

const inventarioController = {
  async index(req, res) {
    try {
      const { historicoId } = req.query;
<<<<<<< HEAD

      if (!historicoId) {
        const items = await prisma.inventarios.findMany({ orderBy: { nome: 'asc' } });
        return res.json(items);
      }

      const hId = Number(historicoId);

      let items = await prisma.inventarios.findMany({
        where: { historico_id: hId },
        orderBy: { nome: 'asc' }
      });

      const temMoeda = items.some(item => item.tipo === 'Moeda');

      if (!temMoeda) {
        const novaMoeda = await prisma.inventarios.create({
          data: {
            nome: 'Aether',
            tipo: 'Moeda',
            quantidade: 0,
            historico_id: hId,
            subtipo: 'Dinheiro',
            descricao: 'Dinheiro usado na dimensão de Aetheris' // Descrição padrão para moeda
          }
        });
        items.push(novaMoeda);
        items.sort((a, b) => a.nome.localeCompare(b.nome));
      }

=======
      const items = await prisma.inventarios.findMany({
        where: historicoId ? { historico_id: Number(historicoId) } : {},
        orderBy: { nome: 'asc' }
      });
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      res.json(items);
    } catch (error) {
      handleErrors(res, error, "index");
    }
  },

  async store(req, res) {
    try {
<<<<<<< HEAD
      // O campo 'descricao' será extraído aqui pelo Zod (precisamos atualizar o validador depois)
      const data = inventarioSchema.parse(req.body);

=======
      const data = inventarioSchema.parse(req.body);

      // ✅ Agora a busca considera também o subtipo para acumular
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      const itemExistente = await prisma.inventarios.findFirst({
        where: {
          historico_id: data.historico_id,
          nome: data.nome,
          tipo: data.tipo,
<<<<<<< HEAD
          subtipo: data.subtipo
=======
          subtipo: data.subtipo // Garante que "Arma: Espada" não some com "Arma: Machado"
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
        }
      });

      if (itemExistente) {
        const novaQuantidade = Number(itemExistente.quantidade) + data.quantidade;
        const atualizado = await prisma.inventarios.update({
          where: { id: itemExistente.id },
<<<<<<< HEAD
          data: { 
            quantidade: novaQuantidade,
            // Opcional: Atualizar a descrição se uma nova for enviada
            descricao: data.descricao || itemExistente.descricao 
          }
=======
          data: { quantidade: novaQuantidade }
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
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
<<<<<<< HEAD
      // O 'data' aqui já incluirá a 'descricao' se ela estiver no esquema de update
=======
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
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
<<<<<<< HEAD

  async updateDinheiro(req, res) {
    try {
      const { id } = req.params;
      const { operacao, valor } = req.body;

=======
  async updateDinheiro(req, res) {
    try {
      const { id } = req.params;
      const { operacao, valor } = req.body; // operacao: 'somar' ou 'subtrair'

      // 1. Busca o item para validar se é Moeda
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      const itemExistente = await prisma.inventarios.findUnique({
        where: { id: Number(id) }
      });

<<<<<<< HEAD
      if (!itemExistente || itemExistente.tipo !== 'Moeda') {
        return res.status(400).json({ error: 'Registro de Moeda inválido' });
      }

      let novaQuantidade = Number(itemExistente.quantidade);
      const valorAlteracao = Number(valor);

      if (operacao === 'adicionar' || operacao === 'somar') {
        novaQuantidade += valorAlteracao;
      } else if (operacao === 'remover' || operacao === 'subtrair') {
        if (novaQuantidade < valorAlteracao) {
          return res.status(400).json({ error: 'Saldo insuficiente' });
        }
        novaQuantidade -= valorAlteracao;
      } else if (operacao === 'fixo') {
        novaQuantidade = valorAlteracao;
      } else {
        return res.status(400).json({ error: 'Operação inválida' });
      }

=======
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
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      const atualizado = await prisma.inventarios.update({
        where: { id: Number(id) },
        data: { quantidade: novaQuantidade }
      });

      res.json(atualizado);
    } catch (error) {
      handleErrors(res, error, "updateDinheiro");
    }
  },
<<<<<<< HEAD

=======
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
  async show(req, res) {
    try {
      const { id } = req.params;
      const itemId = Number(id);

<<<<<<< HEAD
=======
      // Verificação de segurança caso o ID não seja um número
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      if (isNaN(itemId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const item = await prisma.inventarios.findUnique({
        where: { id: itemId },
        include: {
<<<<<<< HEAD
          historico: true,
          itens: true 
=======
          historico: true, // Traz os dados do personagem dono do item
          itens: true      // Traz os detalhes do item base (se houver vínculo)
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
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
<<<<<<< HEAD

=======
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
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