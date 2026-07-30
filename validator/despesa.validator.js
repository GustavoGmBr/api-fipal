import prisma from '../lib/prisma.js';
import { z } from 'zod';
import {
    createDespesaSchema,
    updateDespesaSchema,
    updateDespesaComRateiosSchema,
    queryFiltrosSchema,
    createRateioSchema,
    updateRateioSchema,
    deleteRateiosSchema,
    getRateiosByDespesaSchema,
    relatorioRateiosSchema,
    setoresPermitidos
} from '../schemas/despesa.schema.js';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const arredondarParaCentavos = (valor) => {
    return Math.round(Number(valor) * 100) / 100;
};

const formatarRateio = (rateio) => ({
    ...rateio,
    valor: Number(rateio.valor)
});

const formatarDespesa = (despesa) => ({
    ...despesa,
    valor: Number(despesa.valor),
    total_rateios: despesa.rateios?.reduce((sum, r) => sum + Number(r.valor), 0) || 0,
    rateios: despesa.rateios?.map(formatarRateio) || []
});

const validarMes = (mes) => {
    if (!mes) return null;
    const [ano, mesNum] = mes.split('-').map(Number);
    if (isNaN(ano) || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        return null;
    }
    return { ano, mes: mesNum };
};

const getMesRange = (ano, mes) => {
    const inicio = new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0));
    const fim = new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999));
    return { inicio, fim };
};

// ============================================
// CRUD - DESPESAS
// ============================================

export const create = async (req, res) => {
    try {
        // Validação dos dados com Zod
        const validatedData = createDespesaSchema.parse(req.body);
        
        const { descricao, prestador, valor, data_despesa, rateios } = validatedData;

        // Arredonda os valores
        const valorTotal = arredondarParaCentavos(Number(valor));
        const rateiosArredondados = rateios.map(r => ({
            setor: r.setor,
            valor: arredondarParaCentavos(Number(r.valor))
        }));

        // Verifica soma dos rateios (já validado pelo Zod, mas reforça)
        const somaRateios = rateiosArredondados.reduce((sum, r) => sum + r.valor, 0);
        if (Math.abs(valorTotal - somaRateios) > 0.01) {
            return res.status(400).json({
                success: false,
                error: `A soma dos rateios (${somaRateios.toFixed(2)}) deve ser igual ao valor total da despesa (${valorTotal.toFixed(2)})`
            });
        }

        // Cria a despesa
        const novaDespesa = await prisma.despesas.create({
            data: {
                descricao: descricao || null,
                prestador,
                valor: valorTotal,
                data_despesa: data_despesa || new Date(),
                rateios: {
                    create: rateiosArredondados
                }
            },
            include: {
                rateios: true
            }
        });

        return res.status(201).json({
            success: true,
            data: formatarDespesa(novaDespesa)
        });
    } catch (error) {
        // Tratamento de erro do Zod
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const readAll = async (req, res) => {
    try {
        // Validação dos filtros com Zod
        const validatedQuery = queryFiltrosSchema.parse(req.query);
        const { prestador, descricao, setor, data_inicio, data_fim, com_rateio } = validatedQuery;

        const where = {};
        
        if (prestador) where.prestador = { contains: prestador };
        if (descricao) where.descricao = { contains: descricao };
        
        if (data_inicio || data_fim) {
            where.data_despesa = {};
            if (data_inicio) where.data_despesa.gte = new Date(data_inicio);
            if (data_fim) where.data_despesa.lte = new Date(data_fim);
        }

        if (setor) {
            where.rateios = {
                some: { setor }
            };
        }

        if (com_rateio === true) {
            where.rateios = { some: {} };
        } else if (com_rateio === false) {
            where.rateios = { none: {} };
        }

        const despesas = await prisma.despesas.findMany({
            where,
            include: {
                rateios: true
            },
            orderBy: { data_despesa: 'desc' }
        });

        return res.json({
            success: true,
            data: despesas.map(formatarDespesa)
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const readById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validação do ID
        const idNum = Number(id);
        if (isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido'
            });
        }

        const despesa = await prisma.despesas.findUnique({
            where: { id_despesa: idNum },
            include: {
                rateios: true
            }
        });
        
        if (!despesa) {
            return res.status(404).json({
                success: false,
                error: 'Despesa não encontrada'
            });
        }

        return res.json({
            success: true,
            data: formatarDespesa(despesa)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validação do ID
        const idNum = Number(id);
        if (isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido'
            });
        }

        // Validação dos dados com Zod
        const validatedData = updateDespesaComRateiosSchema.parse(req.body);
        const { descricao, prestador, valor, data_despesa, rateios } = validatedData;

        const data = {};
        if (descricao !== undefined) data.descricao = descricao;
        if (prestador !== undefined) data.prestador = prestador;
        if (valor !== undefined) data.valor = arredondarParaCentavos(Number(valor));
        if (data_despesa !== undefined) data.data_despesa = new Date(data_despesa);

        // Verifica se a despesa existe
        const despesaExistente = await prisma.despesas.findUnique({
            where: { id_despesa: idNum }
        });

        if (!despesaExistente) {
            return res.status(404).json({
                success: false,
                error: 'Despesa não encontrada'
            });
        }

        // Validação dos rateios se fornecidos
        if (rateios && rateios.length > 0) {
            let valorFinal = valor !== undefined ? arredondarParaCentavos(Number(valor)) : arredondarParaCentavos(Number(despesaExistente.valor));

            const somaRateios = rateios.reduce((sum, r) => {
                return sum + arredondarParaCentavos(Number(r.valor));
            }, 0);
            
            const somaRateiosArredondada = arredondarParaCentavos(somaRateios);
            const diferenca = Math.abs(valorFinal - somaRateiosArredondada);
            
            if (diferenca > 0.01) {
                return res.status(400).json({
                    success: false,
                    error: `A soma dos rateios (${somaRateiosArredondada.toFixed(2)}) deve ser igual ao valor total da despesa (${valorFinal.toFixed(2)})`
                });
            }
        }

        // Atualiza a despesa
        const despesa = await prisma.despesas.update({
            where: { id_despesa: idNum },
            data,
            include: {
                rateios: true
            }
        });

        // Atualiza os rateios se fornecidos
        if (rateios && rateios.length > 0) {
            await prisma.rateio.deleteMany({
                where: { id_despesa: idNum }
            });

            await prisma.rateio.createMany({
                data: rateios.map(r => ({
                    id_despesa: idNum,
                    setor: r.setor,
                    valor: arredondarParaCentavos(Number(r.valor))
                }))
            });

            const despesaAtualizada = await prisma.despesas.findUnique({
                where: { id_despesa: idNum },
                include: { rateios: true }
            });

            return res.json({
                success: true,
                data: formatarDespesa(despesaAtualizada)
            });
        }

        return res.json({
            success: true,
            data: formatarDespesa(despesa)
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = Number(id);
        if (isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido'
            });
        }
        
        await prisma.despesas.delete({
            where: { id_despesa: idNum }
        });
        
        return res.json({
            success: true,
            message: 'Despesa removida com sucesso'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// CRUD - RATEIOS
// ============================================

export const getAllRateios = async (req, res) => {
    try {
        console.log('📤 [GET /rateios] Listando todos os rateios');

        // Validação dos filtros
        const validatedQuery = queryFiltrosSchema.parse(req.query);
        const { setor, data_inicio, data_fim, id_despesa } = validatedQuery;

        const where = {};

        if (setor) {
            where.setor = setor;
        }

        if (id_despesa) {
            where.id_despesa = Number(id_despesa);
        }

        if (data_inicio || data_fim) {
            where.despesa = {
                data_despesa: {}
            };
            if (data_inicio) {
                where.despesa.data_despesa.gte = new Date(data_inicio);
            }
            if (data_fim) {
                where.despesa.data_despesa.lte = new Date(data_fim);
            }
        }

        const rateios = await prisma.rateio.findMany({
            where,
            include: {
                despesa: {
                    select: {
                        id_despesa: true,
                        prestador: true,
                        descricao: true,
                        valor: true,
                        data_despesa: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const totalGeral = rateios.reduce((sum, r) => sum + Number(r.valor), 0);

        const porSetor = {};
        rateios.forEach(r => {
            if (!porSetor[r.setor]) porSetor[r.setor] = 0;
            porSetor[r.setor] += Number(r.valor);
        });

        const rateiosFormatados = rateios.map(r => ({
            id_rateio: r.id_rateio,
            id_despesa: r.id_despesa,
            setor: r.setor,
            valor: Number(r.valor),
            created_at: r.created_at,
            updated_at: r.updated_at,
            despesa: r.despesa ? {
                id_despesa: r.despesa.id_despesa,
                prestador: r.despesa.prestador,
                descricao: r.despesa.descricao,
                valor: Number(r.despesa.valor),
                data_despesa: r.despesa.data_despesa
            } : null
        }));

        return res.json({
            success: true,
            data: {
                rateios: rateiosFormatados,
                total: rateios.length,
                total_geral: Number(totalGeral.toFixed(2)),
                por_setor: porSetor,
                filtros_aplicados: {
                    setor: setor || null,
                    data_inicio: data_inicio || null,
                    data_fim: data_fim || null,
                    id_despesa: id_despesa || null
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        console.error('❌ Erro em getAllRateios:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getRateiosByDespesa = async (req, res) => {
    try {
        // Validação com Zod
        const validatedParams = getRateiosByDespesaSchema.parse({
            id_despesa: Number(req.params.id_despesa)
        });

        const { id_despesa } = validatedParams;

        // Verifica se a despesa existe
        const despesa = await prisma.despesas.findUnique({
            where: { id_despesa }
        });

        if (!despesa) {
            return res.status(404).json({
                success: false,
                error: `Despesa com ID ${id_despesa} não encontrada`
            });
        }

        const rateios = await prisma.rateio.findMany({
            where: { id_despesa },
            orderBy: { created_at: 'desc' }
        });

        const rateiosFormatados = rateios.map(formatarRateio);
        const total = rateiosFormatados.reduce((sum, r) => sum + r.valor, 0);

        return res.json({
            success: true,
            data: {
                id_despesa,
                rateios: rateiosFormatados,
                total_rateios: total,
                quantidade: rateiosFormatados.length
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createRateio = async (req, res) => {
    try {
        // Validação com Zod
        const validatedData = createRateioSchema.parse(req.body);
        const { id_despesa, setor, valor } = validatedData;

        const despesa = await prisma.despesas.findUnique({
            where: { id_despesa },
            include: { rateios: true }
        });

        if (!despesa) {
            return res.status(404).json({
                success: false,
                error: 'Despesa não encontrada'
            });
        }

        const somaExistente = despesa.rateios.reduce((sum, r) => sum + arredondarParaCentavos(Number(r.valor)), 0);
        const novoValor = arredondarParaCentavos(Number(valor));
        const valorDespesa = arredondarParaCentavos(Number(despesa.valor));

        if (somaExistente + novoValor > valorDespesa + 0.01) {
            return res.status(400).json({
                success: false,
                error: `Valor total dos rateios (${(somaExistente + novoValor).toFixed(2)}) não pode ultrapassar o valor da despesa (${valorDespesa.toFixed(2)})`
            });
        }

        const rateio = await prisma.rateio.create({
            data: {
                id_despesa,
                setor,
                valor: novoValor
            }
        });

        return res.status(201).json({
            success: true,
            data: formatarRateio(rateio)
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const updateRateio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = Number(id);
        if (isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido'
            });
        }

        // Validação com Zod
        const validatedData = updateRateioSchema.parse({
            id_rateio: idNum,
            ...req.body
        });

        const { setor, valor } = validatedData;

        const rateioExistente = await prisma.rateio.findUnique({
            where: { id_rateio: idNum },
            include: { despesa: true }
        });

        if (!rateioExistente) {
            return res.status(404).json({
                success: false,
                error: 'Rateio não encontrado'
            });
        }

        if (valor !== undefined) {
            const outrosRateios = await prisma.rateio.findMany({
                where: {
                    id_despesa: rateioExistente.id_despesa,
                    id_rateio: { not: idNum }
                }
            });

            const somaOutros = outrosRateios.reduce((sum, r) => sum + arredondarParaCentavos(Number(r.valor)), 0);
            const novoValor = arredondarParaCentavos(Number(valor));
            const valorDespesa = arredondarParaCentavos(Number(rateioExistente.despesa.valor));

            if (somaOutros + novoValor > valorDespesa + 0.01) {
                return res.status(400).json({
                    success: false,
                    error: `Valor total dos rateios (${(somaOutros + novoValor).toFixed(2)}) não pode ultrapassar o valor da despesa (${valorDespesa.toFixed(2)})`
                });
            }
        }

        const rateio = await prisma.rateio.update({
            where: { id_rateio: idNum },
            data: {
                ...(setor !== undefined && { setor }),
                ...(valor !== undefined && { valor: arredondarParaCentavos(Number(valor)) })
            }
        });

        return res.json({
            success: true,
            data: formatarRateio(rateio)
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteRateio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = Number(id);
        if (isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido'
            });
        }
        
        await prisma.rateio.delete({
            where: { id_rateio: idNum }
        });
        
        return res.json({
            success: true,
            message: 'Rateio removido com sucesso'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteMultipleRateios = async (req, res) => {
    try {
        // Validação com Zod
        const validatedData = deleteRateiosSchema.parse(req.body);
        const { ids } = validatedData;

        const result = await prisma.rateio.deleteMany({
            where: {
                id_rateio: { in: ids }
            }
        });

        return res.json({
            success: true,
            message: `${result.count} rateio(s) removido(s) com sucesso`
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// ANÁLISES - DESPESAS
// ============================================

export const getTotalPeriodo = async (req, res) => {
    try {
        const { mes_referencia } = req.query;
        
        const mesValido = validarMes(mes_referencia);
        if (!mesValido) {
            return res.status(400).json({
                success: false,
                error: 'Mês de referência é obrigatório (formato: YYYY-MM)'
            });
        }

        const { inicio, fim } = getMesRange(mesValido.ano, mesValido.mes);

        const [agregacao, rateiosAgregacao] = await Promise.all([
            prisma.despesas.aggregate({
                where: {
                    data_despesa: { gte: inicio, lte: fim }
                },
                _sum: { valor: true }
            }),
            prisma.rateio.aggregate({
                where: {
                    despesa: {
                        data_despesa: { gte: inicio, lte: fim }
                    }
                },
                _sum: { valor: true }
            })
        ]);

        const valorConsolidado = Number(agregacao._sum.valor) || 0;
        const valorRateios = Number(rateiosAgregacao._sum.valor) || 0;

        return res.json({
            success: true,
            data: {
                mes: mes_referencia,
                total: valorConsolidado,
                total_rateios: valorRateios,
                diferenca: valorConsolidado - valorRateios
            }
        });
    } catch (error) {
        console.error("❌ [BACKEND ERRO]:", error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
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
            },
            include: { rateios: true }
        });

        const totals = { atual: 0, anterior: 0 };
        const totalsRateios = { atual: 0, anterior: 0 };

        despesas.forEach(d => {
            const isAtual = d.data_despesa >= inicioMesAtual;
            const valor = Number(d.valor);
            const totalRateios = d.rateios.reduce((sum, r) => sum + Number(r.valor), 0);
            
            if (isAtual) {
                totals.atual += valor;
                totalsRateios.atual += totalRateios;
            } else {
                totals.anterior += valor;
                totalsRateios.anterior += totalRateios;
            }
        });

        const variacao = totals.anterior > 0
            ? `${(((totals.atual - totals.anterior) / totals.anterior) * 100).toFixed(2)}%`
            : 'N/A';

        return res.json({
            success: true,
            data: {
                periodo_atual: {
                    inicio: inicioMesAtual,
                    fim: fimMesAtual,
                    total: totals.atual,
                    total_rateios: totalsRateios.atual
                },
                periodo_anterior: {
                    inicio: inicioMesAnterior,
                    fim: fimMesAnterior,
                    total: totals.anterior,
                    total_rateios: totalsRateios.anterior
                },
                variacao
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getQuarterlyReport = async (req, res) => {
    try {
        const tresMesesAtras = new Date();
        tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

        const despesas = await prisma.despesas.findMany({
            where: { data_despesa: { gte: tresMesesAtras } },
            include: { rateios: true },
            orderBy: { data_despesa: 'asc' }
        });

        const report = {};
        despesas.forEach(d => {
            const mesAno = d.data_despesa.toISOString().substring(0, 7);
            if (!report[mesAno]) report[mesAno] = {};
            
            d.rateios.forEach(r => {
                if (!report[mesAno][r.setor]) report[mesAno][r.setor] = 0;
                report[mesAno][r.setor] += Number(r.valor);
            });
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
                comparativo[s] = { 
                    total: atual, 
                    variacao: variacao ? `${variacao}%` : 'N/A' 
                };
            });
            return { mes, dados: comparativo };
        });

        return res.json({
            success: true,
            data: finalData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
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

        return res.json({
            success: true,
            data: history
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getSectorComparison = async (req, res) => {
    try {
        const { mes_base } = req.query;
        if (!mes_base) {
            return res.status(400).json({
                success: false,
                error: 'Mês base é obrigatório'
            });
        }

        const dataBase = new Date(mes_base + '-01');
        const dataAnterior = new Date(dataBase);
        dataAnterior.setMonth(dataAnterior.getMonth() - 1);

        const rateios = await prisma.rateio.findMany({
            where: {
                despesa: {
                    data_despesa: {
                        gte: dataAnterior,
                        lt: new Date(dataBase.getFullYear(), dataBase.getMonth() + 1, 1)
                    }
                }
            },
            include: {
                despesa: true
            }
        });

        const stats = {};
        rateios.forEach(r => {
            const mes = r.despesa.data_despesa.toISOString().substring(0, 7);
            if (!stats[mes]) stats[mes] = {};
            stats[mes][r.setor] = (stats[mes][r.setor] || 0) + Number(r.valor);
        });

        const mesAtual = mes_base;
        const mesAnterior = dataAnterior.toISOString().substring(0, 7);

        const comparativo = Object.keys(stats[mesAtual] || {}).map(s => {
            const atual = stats[mesAtual]?.[s] || 0;
            const anterior = stats[mesAnterior]?.[s] || 0;
            const variacao = anterior > 0 ? `${(((atual - anterior) / anterior) * 100).toFixed(2)}%` : 'N/A';
            return { setor: s, atual, anterior, variacao };
        });

        Object.keys(stats[mesAnterior] || {}).forEach(s => {
            if (!comparativo.find(c => c.setor === s)) {
                comparativo.push({
                    setor: s,
                    atual: 0,
                    anterior: stats[mesAnterior][s] || 0,
                    variacao: 'N/A'
                });
            }
        });

        return res.json({
            success: true,
            data: comparativo
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getSimpleMonthlyComparison = async (req, res) => {
    try {
        const { mes } = req.query;
        if (!mes) {
            return res.status(400).json({
                success: false,
                error: 'Mês é obrigatório'
            });
        }

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

        return res.json({
            success: true,
            data: final
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// ANÁLISES - RATEIOS
// ============================================

export const getSectorByMonth = async (req, res) => {
    try {
        const { mes, setor } = req.query;
        
        if (!mes || !setor) {
            return res.status(400).json({
                success: false,
                error: 'Mês e setor são obrigatórios'
            });
        }

        const mesValido = validarMes(mes);
        if (!mesValido) {
            return res.status(400).json({
                success: false,
                error: 'Mês inválido (formato: YYYY-MM)'
            });
        }

        // Validação do setor com Zod
        const setorValidado = setoresPermitidos.parse(setor);

        const { inicio, fim } = getMesRange(mesValido.ano, mesValido.mes);

        const rateios = await prisma.rateio.findMany({
            where: {
                setor: setorValidado,
                despesa: {
                    data_despesa: {
                        gte: inicio,
                        lte: fim
                    }
                }
            },
            include: {
                despesa: true
            },
            orderBy: {
                despesa: {
                    data_despesa: 'desc'
                }
            }
        });

        const total = rateios.reduce((sum, r) => sum + Number(r.valor), 0);

        return res.json({
            success: true,
            data: {
                setor: setorValidado,
                mes,
                total,
                quantidade: rateios.length,
                rateios: rateios.map(r => ({
                    ...formatarRateio(r),
                    despesa: {
                        ...r.despesa,
                        valor: Number(r.despesa.valor)
                    }
                }))
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Setor inválido',
                details: error.errors.map(e => e.message)
            });
        }
        console.error("❌ [BACKEND ERRO]:", error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getRateiosByPeriod = async (req, res) => {
    try {
        // Validação com Zod
        const validatedQuery = relatorioRateiosSchema.parse(req.query);
        const { data_inicio, data_fim, setor } = validatedQuery;

        const where = {};
        
        where.despesa = {
            data_despesa: {
                gte: new Date(data_inicio),
                lte: new Date(data_fim)
            }
        };

        if (setor) {
            where.setor = setor;
        }

        const rateios = await prisma.rateio.findMany({
            where,
            include: {
                despesa: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const porSetor = {};
        rateios.forEach(r => {
            if (!porSetor[r.setor]) porSetor[r.setor] = 0;
            porSetor[r.setor] += Number(r.valor);
        });

        const totalGeral = Object.values(porSetor).reduce((sum, val) => sum + val, 0);

        return res.json({
            success: true,
            data: {
                total_geral: totalGeral,
                por_setor: porSetor,
                quantidade_total: rateios.length,
                rateios: rateios.map(r => ({
                    ...formatarRateio(r),
                    despesa: {
                        ...r.despesa,
                        valor: Number(r.despesa.valor)
                    }
                }))
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: error.errors.map(e => ({
                    campo: e.path.join('.'),
                    mensagem: e.message
                }))
            });
        }
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getResumoSetores = async (req, res) => {
    try {
        const { mes } = req.query;
        
        if (!mes) {
            return res.status(400).json({
                success: false,
                error: 'Mês é obrigatório (formato: YYYY-MM)'
            });
        }

        const mesValido = validarMes(mes);
        if (!mesValido) {
            return res.status(400).json({
                success: false,
                error: 'Mês inválido (formato: YYYY-MM)'
            });
        }

        const { inicio, fim } = getMesRange(mesValido.ano, mesValido.mes);

        const rateios = await prisma.rateio.findMany({
            where: {
                despesa: {
                    data_despesa: {
                        gte: inicio,
                        lte: fim
                    }
                }
            },
            include: {
                despesa: true
            }
        });

        const porSetor = {};
        rateios.forEach(r => {
            if (!porSetor[r.setor]) {
                porSetor[r.setor] = {
                    total: 0,
                    quantidade: 0,
                    despesas: new Set()
                };
            }
            porSetor[r.setor].total += Number(r.valor);
            porSetor[r.setor].quantidade += 1;
            porSetor[r.setor].despesas.add(r.id_despesa);
        });

        const totalGeral = Object.values(porSetor).reduce((sum, s) => sum + s.total, 0);
        const resultado = Object.keys(porSetor).map(setor => ({
            setor,
            total: Number(porSetor[setor].total.toFixed(2)),
            quantidade: porSetor[setor].quantidade,
            quantidade_despesas: porSetor[setor].despesas.size,
            percentual: totalGeral > 0 ? parseFloat(((porSetor[setor].total / totalGeral) * 100).toFixed(2)) : 0
        }));

        return res.json({
            success: true,
            data: {
                mes,
                total_geral: Number(totalGeral.toFixed(2)),
                total_despesas: new Set(rateios.map(r => r.id_despesa)).size,
                setores: resultado.sort((a, b) => b.total - a.total)
            }
        });
    } catch (error) {
        console.error("❌ [BACKEND ERRO]:", error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};