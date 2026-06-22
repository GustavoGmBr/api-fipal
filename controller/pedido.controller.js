import prisma from '../lib/prisma.js';

// --- LEITURA E FILTROS ---

export const readAll = async (req, res) => {
  try {
    const { 
      cliente, vendedor, status, cod_comercial,
      data, dataInicio, dataFim, mes, ano 
    } = req.query;

    // 🔥 Correção: Ajustado para 1 (Int) porque o banco não aceita booleano
    const where = { pd_ativo: 1 };

    // Filtros de Texto e Status
    if (cliente) where.cliente = { contains: cliente };
    if (vendedor) where.vendedor = { contains: vendedor };
    if (status) where.status = status;
    if (cod_comercial) where.cod_comercial = { contains: cod_comercial };

    // Lógica de Datas
    if (data) {
      // Data específica
      where.dt_pedido = {
        gte: new Date(`${data}T00:00:00.000Z`),
        lte: new Date(`${data}T23:59:59.999Z`),
      };
    } else if (dataInicio || dataFim) {
      // Entre duas datas
      where.dt_pedido = {};
      if (dataInicio) where.dt_pedido.gte = new Date(`${dataInicio}T00:00:00.000Z`);
      if (dataFim) where.dt_pedido.lte = new Date(`${dataFim}T23:59:59.999Z`);
    } else if (mes || ano) {
      // Mês / Ano
      const filtroAno = ano ? parseInt(ano) : new Date().getFullYear();
      if (mes) {
        const dataInicioMes = new Date(filtroAno, parseInt(mes) - 1, 1);
        const dataFimMes = new Date(filtroAno, parseInt(mes), 0, 23, 59, 59, 999);
        where.dt_pedido = { gte: dataInicioMes, lte: dataFimMes };
      } else {
        where.dt_pedido = {
          gte: new Date(`${filtroAno}-01-01T00:00:00.000Z`),
          lte: new Date(`${filtroAno}-12-31T23:59:59.999Z`),
        };
      }
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: { categoria: true },
      orderBy: { dt_pedido: 'desc' },
    });

    return res.json({ success: true, data: pedidos });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: { categoria: true },
    });
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    }
    return res.json({ success: true, data: pedido });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


// --- CRIAÇÃO E ATUALIZAÇÃO ---

export const create = async (req, res) => {
  try {
    const { 
      cod_comercial, cliente, tipo_veiculo, vendedor, valor_pedido, 
      doc_b2b, status, dias_pedido, id_categoria, pd_ativo, dt_pedido 
    } = req.body;

    const data = { 
      cod_comercial, cliente, tipo_veiculo, vendedor, valor_pedido, 
      doc_b2b, status, dias_pedido, id_categoria, 
      pd_ativo: pd_ativo !== undefined ? Number(pd_ativo) : 1 // 🔥 Garante que salve como Int numérico
    };

    if (dt_pedido !== undefined) data.dt_pedido = new Date(dt_pedido);

    const pedido = await prisma.pedido.create({ 
      data,
      include: { categoria: true }
    });
    return res.status(201).json({ success: true, data: pedido });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      cod_comercial, cliente, tipo_veiculo, vendedor, valor_pedido, 
      doc_b2b, status, dias_pedido, id_categoria, pd_ativo, dt_pedido 
    } = req.body;

    const data = {};
    if (cod_comercial !== undefined) data.cod_comercial = cod_comercial;
    if (cliente !== undefined) data.cliente = cliente;
    if (tipo_veiculo !== undefined) data.tipo_veiculo = tipo_veiculo;
    if (vendedor !== undefined) data.vendedor = vendedor;
    if (valor_pedido !== undefined) data.valor_pedido = valor_pedido;
    if (doc_b2b !== undefined) data.doc_b2b = doc_b2b;
    if (status !== undefined) data.status = status;
    if (dias_pedido !== undefined) data.dias_pedido = dias_pedido;
    if (id_categoria !== undefined) data.id_categoria = id_categoria;
    if (pd_ativo !== undefined) data.pd_ativo = Number(pd_ativo); // 🔥 Converte para numérico se enviado do formulário
    if (dt_pedido !== undefined) data.dt_pedido = new Date(dt_pedido);

    const pedido = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data,
      include: { categoria: true }
    });
    return res.json({ success: true, data: pedido });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// --- REGRAS DE NEGÓCIO (FINALIZAÇÃO / EXCLUSÃO LÓGICA) ---

export const finalizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'Finalizado') {
      return res.status(400).json({ success: false, message: 'Status inválido para finalização' });
    }

    const pedidoExistente = await prisma.pedido.findUnique({ 
      where: { id_pedido: Number(id) } 
    });
    
    if (!pedidoExistente) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }

    const dtPedido = new Date(pedidoExistente.dt_pedido);
    const hoje = new Date();
    const diffTime = Math.abs(hoje - dtPedido);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pedidoFinalizado = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: {
        status: 'Finalizado',
        dias_pedido: diffDays
      },
      include: { categoria: true }
    });

    return res.json({ success: true, data: pedidoFinalizado });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const desativarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: { pd_ativo: 0 }, // 🔥 Alterado para 0 (Int) para respeitar seu banco
    });

    return res.json({ 
      success: true, 
      message: 'Pedido desativado com sucesso',
      data: pedido 
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const ativarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: { pd_ativo: 1 }, // 🔥 Alterado para 1 (Int) para respeitar seu banco
    });

    return res.json({ 
      success: true, 
      message: 'Pedido ativado com sucesso',
      data: pedido 
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Alias de segurança (Soft Delete) substituindo o delete físico antigo
export const remove = async (req, res) => {
  return desativarPedido(req, res);
};

// --- DASHBOARD E RELATÓRIOS ---

export const getReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    // 🔥 Correção 1: Alterado de true para 1 (Int) para bater com o banco de dados
    const baseWhere = { pd_ativo: 1 };
    
    // Define o intervalo do ano atual para a métrica de tempo
    const anoAtual = new Date().getFullYear();
    const inicioAno = new Date(`${anoAtual}-01-01T00:00:00.000Z`);
    const fimAno = new Date(`${anoAtual}-12-31T23:59:59.999Z`);

    // Filtro de data para o Resumo Geral (baseado na query string)
    if (dataInicio || dataFim) {
      baseWhere.dt_pedido = {};
      if (dataInicio) baseWhere.dt_pedido.gte = new Date(`${dataInicio}T00:00:00.000Z`);
      if (dataFim) baseWhere.dt_pedido.lte = new Date(`${dataFim}T23:59:59.999Z`);
    }

    // 1. Resumo Geral (Financeiro e Quantitativo) - Respeita o filtro da query
    const resumoGeral = await prisma.pedido.aggregate({
      where: baseWhere,
      _count: { id_pedido: true },
      _sum: { valor_pedido: true },
      _avg: { valor_pedido: true }
    });

    // 2. Média de Tempo de Faturamento por Tipo de Veículo - APENAS ANO ATUAL
    const mediaPorVeiculo = await prisma.pedido.groupBy({
      by: ['tipo_veiculo'],
      where: {
        pd_ativo: 1, // 🔥 Correção 2: Alterado de true para 1 (Int) aqui também!
        status: 'Finalizado',
        dt_pedido: {
          gte: inicioAno,
          lte: fimAno
        }
      },
      _avg: {
        dias_pedido: true
      },
      _count: {
        id_pedido: true
      }
    });

    return res.json({
      success: true,
      data: {
        resumo: {
          qtd_totais: resumoGeral._count.id_pedido || 0,
          valor_total: Number(resumoGeral._sum.valor_pedido || 0),
          valor_medio: Number(resumoGeral._avg.valor_pedido || 0)
        },
        // Métrica específica do ano atual
        performance_ano_atual: {
          ano: anoAtual,
          dados: mediaPorVeiculo.map(item => ({
            tipo_veiculo: item.tipo_veiculo,
            // 🔥 Ajuste: Trata o retorno médio diretamente do alias gerado pelo groupBy
            media_dias: Number(item._avg?.dias_pedido || 0).toFixed(1),
            total_finalizados: item._count?.id_pedido || 0
          }))
        },
        gerado_em: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAvailableYears = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { pd_ativo: 1 }, // Mantido em 1 (Int) conforme corrigido anteriormente
      select: { dt_pedido: true }
    });

    const anos = [...new Set(
      pedidos
        .map(p => p.dt_pedido ? new Date(p.dt_pedido).getFullYear() : null)
        .filter(ano => ano !== null && !isNaN(ano))
    )].sort((a, b) => b - a);

    return res.json({ success: true, data: anos });
  } catch (error) {
    console.error("❌ Erro em getAvailableYears:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};