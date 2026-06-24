import prisma from '../lib/prisma.js';

// --- LEITURA E FILTROS ---

export const readAll = async (req, res) => {
  try {
    const { 
      referencia, descricao, localizacao, comDivergencia,
      dataInicio, dataFim 
    } = req.query;

    const where = {};

    // Filtros de Texto
    if (referencia) where.referencia = { contains: referencia };
    if (descricao) where.descricao = { contains: descricao };
    if (localizacao) where.localizacao = { contains: localizacao };

    // Filtro de Divergência entre Estoque Físico e Sistema
    if (comDivergencia === 'true') {
      where.NOT = {
        estoqueFisico: {
          equals: prisma.estoque.fields.estoqueSistema
        }
      };
    }

    // Filtros de Data (Baseado na última atualização)
    if (dataInicio || dataFim) {
      where.updated_at = {};
      if (dataInicio) where.updated_at.gte = new Date(`${dataInicio}T00:00:00.000Z`);
      if (dataFim) where.updated_at.lte = new Date(`${dataFim}T23:59:59.999Z`);
    }

    const itensEstoque = await prisma.estoque.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });

    return res.json({ success: true, data: itensEstoque });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.estoque.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item de estoque não encontrado' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// --- CRIAÇÃO E ATUALIZAÇÃO ---

export const create = async (req, res) => {
  try {
    const { 
      referencia, descricao, localizacao, estoqueFisico, estoqueSistema 
    } = req.body;

    const item = await prisma.estoque.create({
      data: {
        referencia,
        descricao,
        localizacao,
        estoqueFisico: estoqueFisico !== undefined ? Number(estoqueFisico) : 0,
        estoqueSistema: estoqueSistema !== undefined ? Number(estoqueSistema) : 0
      }
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      referencia, descricao, localizacao, estoqueFisico, estoqueSistema 
    } = req.body;

    const data = {};
    if (referencia !== undefined) data.referencia = referencia;
    if (descricao !== undefined) data.descricao = descricao;
    if (localizacao !== undefined) data.localizacao = localizacao;
    if (estoqueFisico !== undefined) data.estoqueFisico = Number(estoqueFisico);
    if (estoqueSistema !== undefined) data.estoqueSistema = Number(estoqueSistema);

    const item = await prisma.estoque.update({
      where: { id: Number(id) },
      data
    });

    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// --- REGRAS DE NEGÓCIO (ACERTO / AJUSTE DE ESTOQUE) ---

export const sincronizarEstoque = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o item para saber o valor atual do físico
    const itemExistente = await prisma.estoque.findUnique({
      where: { id: Number(id) }
    });

    if (!itemExistente) {
      return res.status(404).json({ success: false, message: 'Item de estoque não encontrado' });
    }

    // Igualar o estoque do sistema ao estoque físico real medido
    const itemAtualizado = await prisma.estoque.update({
      where: { id: Number(id) },
      data: {
        estoqueSistema: itemExistente.estoqueFisico
      }
    });

    return res.json({ 
      success: true, 
      message: 'Estoque do sistema sincronizado com o físico com sucesso', 
      data: itemAtualizado 
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Exclusão física (já que estoque geralmente não usa soft delete como pedidos)
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.estoque.delete({
      where: { id: Number(id) }
    });

    return res.json({ success: true, message: 'Item removido do estoque com sucesso' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// --- DASHBOARD E RELATÓRIOS ---

export const getReport = async (req, res) => {
  try {
    // 1. Métricas gerais de volumes armazenados
    const resumoGeral = await prisma.estoque.aggregate({
      _count: { id: true },
      _sum: {
        estoqueFisico: true,
        estoqueSistema: true
      }
    });

    // 2. Localizar quantos itens possuem divergências no momento
    const itensDivergentes = await prisma.estoque.findMany({
      where: {
        NOT: {
          estoqueFisico: {
            equals: prisma.estoque.fields.estoqueSistema
          }
        }
      },
      select: {
        id: true,
        referencia: true,
        estoqueFisico: true,
        estoqueSistema: true
      }
    });

    return res.json({
      success: true,
      data: {
        total_produtos_cadastrados: resumoGeral._count.id || 0,
        total_pecas_fisico: resumoGeral._sum.estoqueFisico || 0,
        total_pecas_sistema: resumoGeral._sum.estoqueSistema || 0,
        status_auditoria: {
          total_itens_com_divergencia: itensDivergentes.length,
          itens_divergentes: itensDivergentes.map(item => ({
            id: item.id,
            referencia: item.referencia,
            divergencia_unidades: item.estoqueFisico - item.estoqueSistema
          }))
        },
        gerado_em: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};