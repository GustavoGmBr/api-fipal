import prisma from '../lib/prisma.js';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const arredondarParaCentavos = (valor) => {
    return Math.round(Number(valor) * 100) / 100;
};

const formatarDespesa = (despesa) => ({
    ...despesa,
    valor: Number(despesa.valor)
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

const validarId = (id) => {
    if (!id) return null;
    const idNum = Number(id);
    if (isNaN(idNum) || idNum <= 0) return null;
    return idNum;
};

// ============================================
// CRUD - DESPESAS (SEM RATEIOS NAS RESPOSTAS)
// ============================================

export const create = async (req, res) => {
    try {
        const { descricao, prestador, valor, data_despesa, rateios } = req.body;

        if (!rateios || !Array.isArray(rateios) || rateios.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Pelo menos um rateio é obrigatório'
            });
        }

        const valorTotal = arredondarParaCentavos(Number(valor));
        
        const somaRateios = rateios.reduce((sum, r) => {
            return sum + arredondarParaCentavos(Number(r.valor));
        }, 0);
        
        const somaRateiosArredondada = arredondarParaCentavos(somaRateios);
        const diferenca = Math.abs(valorTotal - somaRateiosArredondada);
        
        if (diferenca > 0.01) {
            return res.status(400).json({
                success: false,
                error: `A soma dos rateios (${somaRateiosArredondada.toFixed(2)}) deve ser igual ao valor total da despesa (${valorTotal.toFixed(2)})`
            });
        }

        const novaDespesa = await prisma.despesas.create({
            data: {
                descricao: descricao || null,
                prestador,
                valor: valorTotal,
                data_despesa: data_despesa ? new Date(data_despesa) : new Date(),
                rateios: {
                    create: rateios.map(r => ({
                        setor: r.setor,
                        valor: arredondarParaCentavos(Number(r.valor))
                    }))
                }
            }
            // REMOVIDO: include: { rateios: true }
        });

        return res.status(201).json({
            success: true,
            data: formatarDespesa(novaDespesa)
        });
    } catch (error) {
        console.error('❌ Erro em create:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const readAll = async (req, res) => {
    try {
        const { prestador, descricao, data_inicio, data_fim } = req.query;

        const where = {};
        
        if (prestador) where.prestador = { contains: prestador };
        if (descricao) where.descricao = { contains: descricao };
        
        if (data_inicio || data_fim) {
            where.data_despesa = {};
            if (data_inicio) where.data_despesa.gte = new Date(data_inicio);
            if (data_fim) where.data_despesa.lte = new Date(data_fim);
        }

        console.log('🔍 Where clause:', JSON.stringify(where, null, 2));

        // 🔥 BUSCA APENAS AS DESPESAS SEM RATEIOS
        const despesas = await prisma.despesas.findMany({
            where,
            // REMOVIDO: include: { rateios: true }
            orderBy: { data_despesa: 'desc' }
        });

        console.log(`📊 Total de despesas: ${despesas.length}`);

        // 🔥 FORMAT A RESPOSTA SEM RATEIOS
        const despesasFormatadas = despesas.map(despesa => ({
            id_despesa: despesa.id_despesa,
            descricao: despesa.descricao,
            prestador: despesa.prestador,
            valor: Number(despesa.valor),
            data_despesa: despesa.data_despesa,
            created_at: despesa.created_at,
            updated_at: despesa.updated_at
        }));

        return res.json({
            success: true,
            data: despesasFormatadas
        });
    } catch (error) {
        console.error('❌ Erro em readAll:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const readById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = validarId(id);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID da despesa inválido'
            });
        }

        const despesa = await prisma.despesas.findUnique({
            where: { id_despesa: idNum }
            // REMOVIDO: include: { rateios: true }
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
        console.error('❌ Erro em readById:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = validarId(id);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID da despesa inválido'
            });
        }

        const { descricao, prestador, valor, data_despesa, rateios } = req.body;

        const despesaExistente = await prisma.despesas.findUnique({
            where: { id_despesa: idNum }
        });

        if (!despesaExistente) {
            return res.status(404).json({
                success: false,
                error: 'Despesa não encontrada'
            });
        }

        const data = {};
        if (descricao !== undefined) data.descricao = descricao;
        if (prestador !== undefined) data.prestador = prestador;
        if (valor !== undefined) data.valor = arredondarParaCentavos(Number(valor));
        if (data_despesa !== undefined) data.data_despesa = new Date(data_despesa);

        if (rateios && rateios.length > 0) {
            let valorFinal = valor !== undefined ? arredondarParaCentavos(Number(valor)) : Number(despesaExistente.valor);

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

        const despesa = await prisma.despesas.update({
            where: { id_despesa: idNum },
            data
            // REMOVIDO: include: { rateios: true }
        });

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

            // Busca apenas a despesa sem rateios
            const despesaAtualizada = await prisma.despesas.findUnique({
                where: { id_despesa: idNum }
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
        console.error('❌ Erro em update:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = validarId(id);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID da despesa inválido'
            });
        }

        const despesaExistente = await prisma.despesas.findUnique({
            where: { id_despesa: idNum }
        });

        if (!despesaExistente) {
            return res.status(404).json({
                success: false,
                error: 'Despesa não encontrada'
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
        console.error('❌ Erro em remove:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// CRUD - RATEIOS (MANTIDO PARA GESTÃO FUTURA)
// ============================================

export const getRateiosByDespesa = async (req, res) => {
    try {
        const { id_despesa } = req.params;
        
        const idNum = validarId(id_despesa);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID da despesa inválido'
            });
        }

        const despesa = await prisma.despesas.findUnique({
            where: { id_despesa: idNum }
        });

        if (!despesa) {
            return res.status(404).json({
                success: false,
                error: `Despesa com ID ${idNum} não encontrada`
            });
        }

        const rateios = await prisma.rateio.findMany({
            where: { id_despesa: idNum },
            orderBy: { created_at: 'desc' }
        });

        const rateiosFormatados = rateios.map(r => ({
            id_rateio: r.id_rateio,
            id_despesa: r.id_despesa,
            setor: r.setor,
            valor: Number(r.valor),
            created_at: r.created_at,
            updated_at: r.updated_at
        }));
        
        const total = rateiosFormatados.reduce((sum, r) => sum + r.valor, 0);

        return res.json({
            success: true,
            data: {
                id_despesa: idNum,
                rateios: rateiosFormatados,
                total_rateios: total,
                quantidade: rateiosFormatados.length
            }
        });
    } catch (error) {
        console.error('❌ Erro em getRateiosByDespesa:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createRateio = async (req, res) => {
    try {
        const { id_despesa, setor, valor } = req.body;

        const idNum = validarId(id_despesa);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID da despesa inválido'
            });
        }

        const despesa = await prisma.despesas.findUnique({
            where: { id_despesa: idNum },
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
                id_despesa: idNum,
                setor,
                valor: novoValor
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id_rateio: rateio.id_rateio,
                id_despesa: rateio.id_despesa,
                setor: rateio.setor,
                valor: Number(rateio.valor),
                created_at: rateio.created_at,
                updated_at: rateio.updated_at
            }
        });
    } catch (error) {
        console.error('❌ Erro em createRateio:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const updateRateio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = validarId(id);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID do rateio inválido'
            });
        }

        const { setor, valor } = req.body;

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
            data: {
                id_rateio: rateio.id_rateio,
                id_despesa: rateio.id_despesa,
                setor: rateio.setor,
                valor: Number(rateio.valor),
                created_at: rateio.created_at,
                updated_at: rateio.updated_at
            }
        });
    } catch (error) {
        console.error('❌ Erro em updateRateio:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteRateio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const idNum = validarId(id);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID do rateio inválido'
            });
        }

        const rateioExistente = await prisma.rateio.findUnique({
            where: { id_rateio: idNum }
        });

        if (!rateioExistente) {
            return res.status(404).json({
                success: false,
                error: 'Rateio não encontrado'
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
        console.error('❌ Erro em deleteRateio:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteMultipleRateios = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Lista de IDs é obrigatória'
            });
        }

        const idsValidos = ids.map(id => validarId(id)).filter(id => id !== null);
        
        if (idsValidos.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum ID válido fornecido'
            });
        }

        const result = await prisma.rateio.deleteMany({
            where: {
                id_rateio: { in: idsValidos }
            }
        });

        return res.json({
            success: true,
            message: `${result.count} rateio(s) removido(s) com sucesso`
        });
    } catch (error) {
        console.error('❌ Erro em deleteMultipleRateios:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// LISTAR TODOS OS RATEIOS - VERSÃO SIMPLIFICADA
// ============================================

export const getAllRateios = async (req, res) => {
    try {
        console.log('📤 [GET /rateios] Listando todos os rateios');
        console.log('📊 Query params:', req.query);

        const { setor, data_inicio, data_fim, id_despesa } = req.query;

        const where = {};

        if (setor) {
            where.setor = setor;
        }

        if (id_despesa) {
            const idNum = validarId(id_despesa);
            if (idNum) {
                where.id_despesa = idNum;
            }
        }

        // Busca SIMPLES sem join para evitar erros
        const rateios = await prisma.rateio.findMany({
            where,
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log(`📊 Encontrados ${rateios.length} rateios`);

        // Formata resposta
        const rateiosFormatados = rateios.map(r => ({
            id_rateio: r.id_rateio,
            id_despesa: r.id_despesa,
            setor: r.setor,
            valor: Number(r.valor) || 0,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));

        // Calcula total geral
        const totalGeral = rateiosFormatados.reduce((sum, r) => sum + r.valor, 0);

        // Agrupa por setor
        const porSetor = {};
        rateiosFormatados.forEach(r => {
            if (!porSetor[r.setor]) {
                porSetor[r.setor] = 0;
            }
            porSetor[r.setor] += r.valor;
        });

        return res.json({
            success: true,
            data: {
                rateios: rateiosFormatados,
                total: rateios.length,
                total_geral: Number(totalGeral.toFixed(2)),
                por_setor: porSetor,
                filtros_aplicados: {
                    setor: setor || null,
                    id_despesa: id_despesa || null
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro em getAllRateios:', error);
        console.error('❌ Stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: 'Erro ao buscar rateios',
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// ============================================
// ANÁLISES - DESPESAS (SEM RATEIOS)
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

        const agregacao = await prisma.despesas.aggregate({
            where: {
                data_despesa: { gte: inicio, lte: fim }
            },
            _sum: { valor: true }
        });

        const valorConsolidado = Number(agregacao._sum.valor) || 0;

        return res.json({
            success: true,
            data: {
                mes: mes_referencia,
                total: valorConsolidado
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
            }
            // REMOVIDO: include: { rateios: true }
        });

        const totals = { atual: 0, anterior: 0 };

        despesas.forEach(d => {
            const isAtual = d.data_despesa >= inicioMesAtual;
            const valor = Number(d.valor);
            
            if (isAtual) {
                totals.atual += valor;
            } else {
                totals.anterior += valor;
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
                    total: totals.atual
                },
                periodo_anterior: {
                    inicio: inicioMesAnterior,
                    fim: fimMesAnterior,
                    total: totals.anterior
                },
                variacao
            }
        });
    } catch (error) {
        console.error('❌ Erro em getDayBasedComparison:', error);
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
            orderBy: { data_despesa: 'asc' }
        });

        const report = {};
        despesas.forEach(d => {
            const mesAno = d.data_despesa.toISOString().substring(0, 7);
            if (!report[mesAno]) report[mesAno] = 0;
            report[mesAno] += Number(d.valor);
        });

        const meses = Object.keys(report).sort();
        const finalData = meses.map((mes, index) => {
            const atual = report[mes];
            const anterior = index > 0 ? report[meses[index - 1]] : null;
            let variacao = null;
            if (anterior !== null && anterior > 0) {
                variacao = (((atual - anterior) / anterior) * 100).toFixed(2);
            }
            return { 
                mes, 
                total: atual,
                variacao: variacao ? `${variacao}%` : 'N/A' 
            };
        });

        return res.json({
            success: true,
            data: finalData
        });
    } catch (error) {
        console.error('❌ Erro em getQuarterlyReport:', error);
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
        console.error('❌ Erro em getMonthlyHistory:', error);
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
        console.error('❌ Erro em getSectorComparison:', error);
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
        console.error('❌ Erro em getSimpleMonthlyComparison:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// ANÁLISES - RATEIOS (MANTIDOS)
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

        const { inicio, fim } = getMesRange(mesValido.ano, mesValido.mes);

        const rateios = await prisma.rateio.findMany({
            where: {
                setor: setor,
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
                setor,
                mes,
                total,
                quantidade: rateios.length,
                rateios: rateios.map(r => ({
                    id_rateio: r.id_rateio,
                    id_despesa: r.id_despesa,
                    setor: r.setor,
                    valor: Number(r.valor),
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    despesa: {
                        id_despesa: r.despesa.id_despesa,
                        descricao: r.despesa.descricao,
                        prestador: r.despesa.prestador,
                        valor: Number(r.despesa.valor),
                        data_despesa: r.despesa.data_despesa
                    }
                }))
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

export const getRateiosByPeriod = async (req, res) => {
    try {
        const { data_inicio, data_fim } = req.query;

        const where = {};
        if (data_inicio || data_fim) {
            where.despesa = {};
            if (data_inicio) where.despesa.data_despesa = { gte: new Date(data_inicio) };
            if (data_fim) where.despesa.data_despesa = { lte: new Date(data_fim) };
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
                    id_rateio: r.id_rateio,
                    id_despesa: r.id_despesa,
                    setor: r.setor,
                    valor: Number(r.valor),
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    despesa: {
                        id_despesa: r.despesa.id_despesa,
                        descricao: r.despesa.descricao,
                        prestador: r.despesa.prestador,
                        valor: Number(r.despesa.valor),
                        data_despesa: r.despesa.data_despesa
                    }
                }))
            }
        });
    } catch (error) {
        console.error('❌ Erro em getRateiosByPeriod:', error);
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