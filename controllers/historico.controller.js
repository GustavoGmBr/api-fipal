import prisma from '../lib/prisma.js';
import { historicoSchema } from '../validator/historico.validator.js';
import { ZodError } from 'zod';

const store = async (req, res) => {
  try {
<<<<<<< HEAD
    // Agora 'rest' contém: equipamento, habilidades, elementos, etc.
=======
    // Agora o 'rest' contém xpAtual e xpProximo vindos do validator
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
    const { inventario, ...rest } = historicoSchema.parse(req.body);

    const historico = await prisma.personagem_historico.create({
      data: {
        ...rest,
<<<<<<< HEAD
        // O Prisma lida com o array de habilidades vindo no 'rest' como JSON
        inventario: {
          create: inventario || [] 
=======
        inventario: {
          create: inventario // Criará os itens com nome, tipo, subtipo e itensId_item
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
        }
      },
      include: { inventario: true }
    });

    return res.status(201).json(historico);
  } catch (error) {
    handleErrors(res, error, "store");
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const historicoId = Number(id);

  try {
    const { inventario, ...rest } = historicoSchema.parse(req.body);

    const historico = await prisma.$transaction(async (tx) => {
<<<<<<< HEAD
      // 1. Limpa o inventário antigo (relação 1:N física)
=======
      // Limpa inventário antigo para sobrescrever com o novo estado
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      await tx.inventarios.deleteMany({
        where: { historico_id: historicoId }
      });

<<<<<<< HEAD
      // 2. Atualiza o histórico e recria o inventário
      // O campo 'habilidades' dentro de 'rest' substituirá o JSON antigo no banco
=======
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      return await tx.personagem_historico.update({
        where: { id: historicoId },
        data: {
          ...rest,
          inventario: {
<<<<<<< HEAD
            create: inventario || []
          }
        },
        include: { inventario: true }
=======
            create: inventario
          }
        },
        include: { inventario: { include: { itens: true } } }
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
      });
    });

    return res.json(historico);
  } catch (error) {
    handleErrors(res, error, "update");
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
        capitulo: true,
        inventario: {
<<<<<<< HEAD
=======
          // ✅ CORREÇÃO: De 'item' para 'itens'
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
          include: { itens: true }
        }
      }
    });
    if (!historico) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json(historico);
  } catch (error) {
    handleErrors(res, error, "show");
  }
};

const timeline = async (req, res) => {
  const { personagemId } = req.params;
  try {
    const historicos = await prisma.personagem_historico.findMany({
      where: { personagem_id: Number(personagemId) },
      include: {
        raca: true,
        livro: { select: { titulo: true } },
        capitulo: { select: { numero: true, titulo: true } },
        inventario: {
<<<<<<< HEAD
          include: { itens: { select: { nome: true } } }
=======
          include: { itens: { select: { nome: true } } } // ✅ Corrigido para plural
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
        }
      },
      orderBy: { criado_em: 'desc' }
    });
    return res.json(historicos);
  } catch (error) {
    handleErrors(res, error, "timeline");
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
    handleErrors(res, error, "destroy");
  }
};

function handleErrors(res, error, context) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Erro de validação", detalhes: error.errors });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado' });
  }
  console.error(`❌ Erro Prisma (${context}):`, error);
  return res.status(500).json({ error: `Erro interno no servidor (${context})` });
}

<<<<<<< HEAD
export default { store, update, show, destroy, timeline };
=======
export default { store, update, show, destroy, timeline }
>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
