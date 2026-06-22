import prisma from '../lib/prisma.js';

// --- CRUD BÁSICO ---

export const readAll = async (req, res) => {
  try {
    const { prestador, descricao, setor, data_inicio, data_fim } = req.query;

    const where = {};
    if (prestador) where.prestador = { contains: prestador };
    if (descricao) where.descricao = { contains: descricao };
    if (setor) where.setor = setor;
    if (data_inicio || data_fim) {
      where.data_despesa = {};
      if (data_inicio) where.data_despesa.gte = new Date(data_inicio);
      if (data_fim) where.data_despesa.lte = new Date(data_fim);
    }

    const despesas = await prisma.despesas.findMany({
      where,
      orderBy: { data_despesa: 'desc' }
    });
    return res.json({ success: true, data: despesas });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const despesa = await prisma.despesas.findUnique({
      where: { id_despesa: Number(id) }
    });
    if (!despesa) return res.status(404).json({ success: false, error: 'Despesa não encontrada' });
    return res.json({ success: true, data: despesa });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { descricao, prestador, valor, setor, data_despesa } = req.body;
    const novaDespesa = await prisma.despesas.create({
      data: {
        descricao,
        prestador,
        valor: Number(valor),
        setor,
        data_despesa: new Date(data_despesa)
      }
    });
    return res.status(201).json({ success: true, data: novaDespesa });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, prestador, valor, setor, data_despesa } = req.body;
    const data = {};
    if (descricao !== undefined) data.descricao = descricao;
    if (prestador !== undefined) data.prestador = prestador;
    if (valor !== undefined) data.valor = Number(valor);
    if (setor !== undefined) data.setor = setor;
    if (data_despesa !== undefined) data.data_despesa = new Date(data_despesa);

    const despesa = await prisma.despesas.update({
      where: { id_despesa: Number(id) },
      data
    });
    return res.json({ success: true, data: despesa });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.despesas.delete({ where: { id_despesa: Number(id) } });
    return res.json({ success: true, message: 'Despesa removida' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// --- ADIÇÕES ANALÍTICAS ---

// NOVA: Soma total de um mês específico (exigido pelo Hook)
export const getTotalPeriodo = async (req, res) => {
  try {
    const { mes_referencia } = req.query; // Recebe o formato "YYYY-MM" (ex: "2026-05")
    if (!mes_referencia) {
      return res.status(400).json({ success: false, error: 'Mês de referência é obrigatório' });
    }

    // Desestruturamos ano e mês para criar as datas de forma segura
    const [ano, mes] = mes_referencia.split('-').map(Number);

    // Forçamos o início do mês no fuso zero (UTC) às 00:00:00
    const inicioMes = new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0));

    // Forçamos o último dia do mês no fuso zero (UTC) até as 23:59:59
    const fimMes = new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999));

    const agregacao = await prisma.despesas.aggregate({
      where: {
        data_despesa: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      _sum: { valor: true }
    });

    const valorConsolidado = Number(agregacao._sum.valor) || 0;

    return res.json({
      success: true,
      data: { total: valorConsolidado }
    });
  } catch (error) {
    console.error("❌ [BACKEND ERRO]:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getDayBasedComparison = async (req, res) => {
  try {
    const hoje = new Date();
    const diaAtual = hoje.getDate();

    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMesAtual = hoje;

    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, diaAtual);

    const despesas = await prisma.despesas.findMany({
      where: {
        OR: [
          { data_despesa: { gte: inicioMesAtual, lte: fimMesAtual } },
          { data_despesa: { gte: inicioMesAnterior, lte: fimMesAnterior } }
        ]
      }
    });

    const totals = { atual: 0, anterior: 0 };
    despesas.forEach(d => {
      if (d.data_despesa >= inicioMesAtual) totals.atual += Number(d.valor);
      else totals.anterior += Number(d.valor);
    });

    const variacao = totals.anterior > 0
      ? `${(((totals.atual - totals.anterior) / totals.anterior) * 100).toFixed(2)}%`
      : 'N/A';

    return res.json({
      success: true,
      data: {
        periodo_atual: { inicio: inicioMesAtual, fim: fimMesAtual, total: totals.atual },
        periodo_anterior: { inicio: inicioMesAnterior, fim: fimMesAnterior, total: totals.anterior },
        variacao
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getQuarterlyReport = async (req, res) => {
  try {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const despesas = await prisma.despesas.findMany({
      where: { data_despesa: { gte: tresMesesAtras } },
      orderBy: { data_despesa: 'asc' }
    });

    const report = {};
    despesas.forEach(d => {
      const mesAno = d.data_despesa.toISOString().substring(0, 7);
      if (!report[mesAno]) report[mesAno] = {};
      report[mesAno][d.setor] = (report[mesAno][d.setor] || 0) + Number(d.valor);
    });

    const meses = Object.keys(report).sort();
    const finalData = meses.map((mes, index) => {
      const setores = report[mes];
      const comparativo = {};
      Object.keys(setores).forEach(s => {
        const atual = setores[s];
        const anterior = index > 0 ? (report[meses[index - 1]][s] || 0) : null;
        let variacao = null;
        if (anterior !== null && anterior > 0) {
          variacao = (((atual - anterior) / anterior) * 100).toFixed(2);
        }
        comparativo[s] = { total: atual, variacao: variacao ? `${variacao}%` : 'N/A' };
      });
      return { mes, dados: comparativo };
    });

    return res.json({ success: true, data: finalData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getMonthlyHistory = async (req, res) => {
  try {
    const agrupado = await prisma.despesas.groupBy({
      by: ['data_despesa'],
      _sum: { valor: true },
      orderBy: { data_despesa: 'desc' }
    });

    const consolidado = {};
    agrupado.forEach(item => {
      const mesAno = item.data_despesa.toISOString().substring(0, 7);
      consolidado[mesAno] = (consolidado[mesAno] || 0) + Number(item._sum.valor);
    });

    const meses = Object.keys(consolidado).sort().reverse();
    const history = meses.map((mes, index) => {
      const atual = consolidado[mes];
      const anterior = index < meses.length - 1 ? consolidado[meses[index + 1]] : null;
      let variacao = 'N/A';
      if (anterior && anterior > 0) {
        variacao = `${(((atual - anterior) / anterior) * 100).toFixed(2)}%`;
      }
      return { mes, total: atual, variacao };
    });

    return res.json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getSectorComparison = async (req, res) => {
  try {
    const { mes_base } = req.query;
    if (!mes_base) return res.status(400).json({ success: false, error: 'Mês base é obrigatório' });

    const dataBase = new Date(mes_base + '-01');
    const dataAnterior = new Date(dataBase);
    dataAnterior.setMonth(dataAnterior.getMonth() - 1);

    const despesas = await prisma.despesas.findMany({
      where: {
        data_despesa: {
          gte: dataAnterior,
          lt: new Date(dataBase.getFullYear(), dataBase.getMonth() + 1, 1)
        }
      }
    });

    const stats = { [mes_base]: {}, [dataAnterior.toISOString().substring(0, 7)]: {} };
    despesas.forEach(d => {
      const m = d.data_despesa.toISOString().substring(0, 7);
      if (stats[m]) {
        stats[m][d.setor] = (stats[m][d.setor] || 0) + Number(d.valor);
      }
    });

    const comparativo = Object.keys(stats[mes_base]).map(s => {
      const atual = stats[mes_base][s] || 0;
      const anterior = stats[dataAnterior.toISOString().substring(0, 7)][s] || 0;
      const variacao = anterior > 0 ? `${(((atual - anterior) / anterior) * 100).toFixed(2)}%` : 'N/A';
      return { setor: s, atual, anterior, variacao };
    });

    return res.json({ success: true, data: comparativo });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getSimpleMonthlyComparison = async (req, res) => {
  try {
    const { mes } = req.query;
    const dataBase = new Date(mes + '-01');
    const dataAnterior = new Date(dataBase);
    dataAnterior.setMonth(dataAnterior.getMonth() - 1);

    const resultados = await prisma.despesas.groupBy({
      by: ['data_despesa'],
      _sum: { valor: true },
      where: {
        data_despesa: {
          gte: dataAnterior,
          lt: new Date(dataBase.getFullYear(), dataBase.getMonth() + 1, 1)
        }
      }
    });

    const final = { [mes]: 0, [dataAnterior.toISOString().substring(0, 7)]: 0 };
    resultados.forEach(r => {
      const m = r.data_despesa.toISOString().substring(0, 7);
      if (final[m] !== undefined) final[m] += Number(r._sum.valor);
    });

    return res.json({ success: true, data: final });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};