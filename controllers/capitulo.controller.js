import prisma from '../lib/prisma.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import capituloSchema from '../validator/capitulo.validator.js';

// Utilitário para BigInt (Caso outras tabelas usem, mantemos por segurança)
const toJSON = (obj) => JSON.parse(JSON.stringify(obj, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
));

const handleError = (error, res) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Erro de validação', errors: error.errors });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Registro não encontrado' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Erro interno no servidor' });
};

const capituloController = {
  // Lista capítulos e seus subcapítulos ( children )
  async listarPorLivro(req, res) {
    try {
      const { livroId } = req.params;
      const capitulos = await prisma.capitulos.findMany({
        where: {
          livro_id: Number(livroId),
          parent_id: null
        },
        include: {
          children: {
            orderBy: { numero: 'asc' }
          }
        },
        orderBy: { numero: 'asc' }
      });
      res.json(toJSON(capitulos));
    } catch (error) {
      handleError(error, res);
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      // Validação: Se o ID não existir ou não for um número válido
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'ID do capítulo é inválido ou não foi fornecido.' });
      }

      const capitulo = await prisma.capitulos.findUnique({
        where: { id: Number(id) }, // Agora garantimos que isso é um número real
        include: {
          parent: true,
          children: { orderBy: { numero: 'asc' } }
        }
      });

      if (!capitulo) return res.status(404).json({ message: 'Capítulo não encontrado' });

      // ... restante da sua lógica de herança e personagens ...

      res.json(toJSON({
        ...capitulo,
        personagens_detalhes: personagensVinculados
      }));
    } catch (error) {
      console.error("❌ Erro no show do capítulo:", error);
      handleError(error, res);
    }
  },

  async store(req, res) {
    try {
      const validatedData = capituloSchema.parse(req.body);
      const capitulo = await prisma.capitulos.create({ data: validatedData });
      res.status(201).json(toJSON(capitulo));
    } catch (error) {
      handleError(error, res);
    }
  },

  async listarRecentes(req, res) {
    try {
      const capitulosRecentes = await prisma.capitulos.findMany({
        take: 3,
        // Removi o filtro de parent_id para garantir que os ÚLTIMOS 3 cadastros apareçam, 
        // independente de serem capítulos ou subcapítulos.
        orderBy: {
          id: 'desc'
        },
        include: {
          livros: {
            select: {
              titulo: true,
              data_publicacao: true
            }
          }
        }
      });

      // Mapeamento com fallback para campos nulos
      const resultadoFormatado = capitulosRecentes.map(cap => ({
        id: cap.id,
        titulo: cap.titulo || "Sem título",
        numero: cap.numero,
        livro: cap.livros?.titulo || "Crônica Isolada",
        data: cap.livros?.data_publicacao || null
      }));

      return res.json(toJSON(resultadoFormatado));
    } catch (error) {
      console.error("❌ Erro ao buscar últimas crônicas:", error);
      handleError(error, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = capituloSchema.parse(req.body);
      const capitulo = await prisma.capitulos.update({
        where: { id: Number(id) },
        data: validatedData,
      });
      res.json(toJSON(capitulo));
    } catch (error) {
      handleError(error, res);
    }
  },
  // 🚀 ADICIONE ESTE MÉTODO AGORA:
  async updateConteudo(req, res) {
    try {
      const { id } = req.params;
      const { blocos } = req.body; // O array de blocos vindo do editor

      // Validamos se o ID é um número
      if (!id) return res.status(400).json({ message: 'ID do capítulo é obrigatório' });

      const capitulo = await prisma.capitulos.update({
        where: { id: Number(id) },
        data: {
          conteudo_json: blocos // Salva o array no novo campo JSON
        }
      });

      return res.json(toJSON(capitulo));
    } catch (error) {
      console.error('Erro ao atualizar conteúdo JSON:', error);
      // Se o erro for do Prisma (registro não encontrado)
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Capítulo não encontrado' });
      }
      return res.status(500).json({ message: 'Erro interno ao salvar conteúdo' });
    }
  },
  async destroy(req, res) {
    try {
      const { id } = req.params;
      await prisma.capitulos.delete({ where: { id: Number(id) } });
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  },
};

export default capituloController;