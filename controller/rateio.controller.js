// controller/rateio.controller.js
import prisma from '../lib/prisma.js';

// Funções auxiliares
const validarId = (id) => {
    if (!id) return null;
    const idNum = Number(id);
    if (isNaN(idNum) || idNum <= 0) return null;
    return idNum;
};

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
// 1. GET /rateios - Listar todos os rateios
// ============================================
export const getAllRateios = async (req, res) => {
    try {
        console.log('📤 [GET] /rateios');
        console.log('📊 Query params:', req.query);

        const { setor, id_despesa } = req.query;
        const where = {};

        if (setor) where.setor = setor;
        if (id_despesa) {
            const idNum = validarId(id_despesa);
            if (idNum) where.id_despesa = idNum;
        }

        const rateios = await prisma.rateio.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        console.log(`📊 Encontrados ${rateios.length} rateios`);

        const rateiosFormatados = rateios.map(r => ({
            id_rateio: r.id_rateio,
            id_despesa: r.id_despesa,
            setor: r.setor,
            valor: Number(r.valor),
            created_at: r.created_at,
            updated_at: r.updated_at
        }));

        const totalGeral = rateiosFormatados.reduce((sum, r) => sum + r.valor, 0);

        const porSetor = {};
        rateiosFormatados.forEach(r => {
            if (!porSetor[r.setor]) porSetor[r.setor] = 0;
            porSetor[r.setor] += r.valor;
        });

        return res.json({
            success: true,
            data: {
                rateios: rateiosFormatados,
                total: rateios.length,
                total_geral: Number(totalGeral.toFixed(2)),
                por_setor: porSetor
            }
        });
    } catch (error) {
        console.error('❌ Erro em getAllRateios:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// 2. GET /rateios/despesa/:id_despesa
// ============================================
export const getRateiosByDespesa = async (req, res) => {
    try {
        const { id_despesa } = req.params;
        console.log(`📤 [GET] /rateios/despesa/${id_despesa}`);
        
        const idNum = validarId(id_despesa);
        if (!idNum) {
            return res.status(400).json({
                success: false,
                error: 'ID da despesa inválido'
            });
        }

        // Busca os rateios diretamente - SEMPRE retorna 200 mesmo se não tiver rateios
        const rateios = await prisma.rateio.findMany({
            where: { id_despesa: idNum },
            orderBy: { created_at: 'desc' }
        });

        console.log(`📊 Despesa ${idNum}: ${rateios.length} rateios encontrados`);

        const rateiosFormatados = rateios.map(r => ({
            id_rateio: r.id_rateio,
            id_despesa: r.id_despesa,
            setor: r.setor,
            valor: Number(r.valor),
            created_at: r.created_at,
            updated_at: r.updated_at
        }));

        const total = rateiosFormatados.reduce((sum, r) => sum + r.valor, 0);

        // SEMPRE retorna 200, mesmo se não tiver rateios
        return res.json({
            success: true,
            data: {
                id_despesa: idNum,
                rateios: rateiosFormatados,
                total_rateios: Number(total.toFixed(2)),
                quantidade: rateiosFormatados.length
            }
        });
    } catch (error) {
        console.error('❌ Erro em getRateiosByDespesa:', error);
        // Em caso de erro, retorna array vazio ao invés de 500
        return res.json({
            success: true,
            data: {
                id_despesa: Number(req.params.id_despesa) || 0,
                rateios: [],
                total_rateios: 0,
                quantidade: 0
            }
        });
    }
};

// ============================================
// 3. GET /rateios/comparacao-setores
// ============================================
export const getSectorComparison = async (req, res) => {
    try {
        const { mes_base } = req.query;
        console.log(`📤 [GET] /rateios/comparacao-setores?mes_base=${mes_base}`);
        
        if (!mes_base) {
            return res.status(400).json({
                success: false,
                error: 'Mês base é obrigatório'
            });
        }

        const mesValido = validarMes(mes_base);
        if (!mesValido) {
            return res.status(400).json({
                success: false,
                error: 'Mês base inválido'
            });
        }

        // Mês atual
        const { inicio: inicioAtual, fim: fimAtual } = getMesRange(mesValido.ano, mesValido.mes);
        
        // Mês anterior
        let mesAnterior = mesValido.mes - 1;
        let anoAnterior = mesValido.ano;
        if (mesAnterior === 0) {
            mesAnterior = 12;
            anoAnterior = mesValido.ano - 1;
        }
        const { inicio: inicioAnterior, fim: fimAnterior } = getMesRange(anoAnterior, mesAnterior);

        // Busca rateios do mês atual
        const rateiosAtuais = await prisma.rateio.findMany({
            where: {
                despesa: {
                    data_despesa: {
                        gte: inicioAtual,
                        lte: fimAtual
                    }
                }
            }
        });

        // Busca rateios do mês anterior
        const rateiosAnteriores = await prisma.rateio.findMany({
            where: {
                despesa: {
                    data_despesa: {
                        gte: inicioAnterior,
                        lte: fimAnterior
                    }
                }
            }
        });

        // Agrupa por setor
        const stats = {};

        // Processa rateios atuais
        rateiosAtuais.forEach(r => {
            if (!stats[r.setor]) stats[r.setor] = { atual: 0, anterior: 0 };
            stats[r.setor].atual += Number(r.valor);
        });

        // Processa rateios anteriores
        rateiosAnteriores.forEach(r => {
            if (!stats[r.setor]) stats[r.setor] = { atual: 0, anterior: 0 };
            stats[r.setor].anterior += Number(r.valor);
        });

        // Formata o resultado
        const comparativo = Object.keys(stats).map(setor => {
            const atual = stats[setor].atual;
            const anterior = stats[setor].anterior;
            let variacao = 'N/A';
            
            if (anterior > 0) {
                const variacaoNum = ((atual - anterior) / anterior) * 100;
                variacao = variacaoNum.toFixed(2) + '%';
            } else if (anterior === 0 && atual > 0) {
                variacao = '+100%';
            }

            return {
                setor,
                atual: Number(atual.toFixed(2)),
                anterior: Number(anterior.toFixed(2)),
                variacao
            };
        });

        // Ordena por valor atual (maior para menor)
        comparativo.sort((a, b) => b.atual - a.atual);

        return res.json({
            success: true,
            data: {
                mes_base,
                mes_anterior: `${anoAnterior}-${String(mesAnterior).padStart(2, '0')}`,
                comparativo
            }
        });
    } catch (error) {
        console.error('❌ Erro em getSectorComparison:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// 4. GET /rateios/resumo-setores
// ============================================
export const getResumoSetores = async (req, res) => {
    try {
        const { mes } = req.query;
        console.log(`📤 [GET] /rateios/resumo-setores?mes=${mes}`);
        
        if (!mes) {
            return res.status(400).json({
                success: false,
                error: 'Mês é obrigatório'
            });
        }

        const mesValido = validarMes(mes);
        if (!mesValido) {
            return res.status(400).json({
                success: false,
                error: 'Mês inválido'
            });
        }

        const { inicio, fim } = getMesRange(mesValido.ano, mesValido.mes);

        // Busca todos os rateios do mês com suas despesas
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

        console.log(`📊 Encontrados ${rateios.length} rateios para ${mes}`);

        // Agrupa por setor
        const porSetor = {};
        const despesasSet = new Set();

        rateios.forEach(r => {
            despesasSet.add(r.id_despesa);
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
                total_despesas: despesasSet.size,
                total_rateios: rateios.length,
                setores: resultado.sort((a, b) => b.total - a.total)
            }
        });
    } catch (error) {
        console.error('❌ Erro em getResumoSetores:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// 5. GET /rateios/periodo
// ============================================
export const getRateiosByPeriod = async (req, res) => {
    try {
        const { data_inicio, data_fim } = req.query;
        console.log(`📤 [GET] /rateios/periodo?data_inicio=${data_inicio}&data_fim=${data_fim}`);
        
        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                success: false,
                error: 'Data inicial e final são obrigatórias'
            });
        }

        const rateios = await prisma.rateio.findMany({
            where: {
                despesa: {
                    data_despesa: {
                        gte: new Date(data_inicio),
                        lte: new Date(data_fim)
                    }
                }
            },
            include: {
                despesa: {
                    select: {
                        id_despesa: true,
                        descricao: true,
                        prestador: true,
                        valor: true,
                        data_despesa: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        console.log(`📊 Encontrados ${rateios.length} rateios no período`);

        const porSetor = {};
        rateios.forEach(r => {
            if (!porSetor[r.setor]) porSetor[r.setor] = 0;
            porSetor[r.setor] += Number(r.valor);
        });

        const totalGeral = Object.values(porSetor).reduce((sum, val) => sum + val, 0);

        return res.json({
            success: true,
            data: {
                total_geral: Number(totalGeral.toFixed(2)),
                por_setor: porSetor,
                quantidade_total: rateios.length,
                rateios: rateios.map(r => ({
                    id_rateio: r.id_rateio,
                    id_despesa: r.id_despesa,
                    setor: r.setor,
                    valor: Number(r.valor),
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    despesa: r.despesa
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

// ============================================
// 6. GET /rateios/setor-mes
// ============================================
export const getSectorByMonth = async (req, res) => {
    try {
        const { mes, setor } = req.query;
        console.log(`📤 [GET] /rateios/setor-mes?mes=${mes}&setor=${setor}`);
        
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
                error: 'Mês inválido'
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
                despesa: {
                    select: {
                        id_despesa: true,
                        descricao: true,
                        prestador: true,
                        valor: true,
                        data_despesa: true
                    }
                }
            },
            orderBy: {
                despesa: {
                    data_despesa: 'desc'
                }
            }
        });

        console.log(`📊 Setor ${setor} em ${mes}: ${rateios.length} rateios`);

        const total = rateios.reduce((sum, r) => sum + Number(r.valor), 0);

        return res.json({
            success: true,
            data: {
                setor,
                mes,
                total: Number(total.toFixed(2)),
                quantidade: rateios.length,
                rateios: rateios.map(r => ({
                    id_rateio: r.id_rateio,
                    id_despesa: r.id_despesa,
                    setor: r.setor,
                    valor: Number(r.valor),
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                    despesa: r.despesa
                }))
            }
        });
    } catch (error) {
        console.error('❌ Erro em getSectorByMonth:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============================================
// 7. GET /rateios/estatisticas
// ============================================
export const getRateioStats = async (req, res) => {
    try {
        const { mes } = req.query;
        console.log(`📤 [GET] /rateios/estatisticas?mes=${mes}`);
        
        let where = {};
        let dataReferencia = 'todos';
        
        if (mes) {
            const mesValido = validarMes(mes);
            if (mesValido) {
                const { inicio, fim } = getMesRange(mesValido.ano, mesValido.mes);
                where = {
                    despesa: {
                        data_despesa: {
                            gte: inicio,
                            lte: fim
                        }
                    }
                };
                dataReferencia = mes;
            }
        }

        // Busca todos os rateios
        const rateios = await prisma.rateio.findMany({
            where,
            include: {
                despesa: {
                    select: {
                        id_despesa: true
                    }
                }
            }
        });

        console.log(`📊 Estatísticas: ${rateios.length} rateios`);

        // Calcula totais
        let totalGeral = 0;
        const porSetor = {};
        const despesasSet = new Set();

        rateios.forEach(r => {
            totalGeral += Number(r.valor);
            despesasSet.add(r.id_despesa);
            
            if (!porSetor[r.setor]) {
                porSetor[r.setor] = { total: 0, quantidade: 0 };
            }
            porSetor[r.setor].total += Number(r.valor);
            porSetor[r.setor].quantidade += 1;
        });

        const setoresFormatados = Object.keys(porSetor).map(setor => ({
            setor,
            total: Number(porSetor[setor].total.toFixed(2)),
            quantidade: porSetor[setor].quantidade,
            percentual: totalGeral > 0 ? parseFloat(((porSetor[setor].total / totalGeral) * 100).toFixed(2)) : 0
        }));

        return res.json({
            success: true,
            data: {
                mes: dataReferencia,
                total_geral: Number(totalGeral.toFixed(2)),
                total_rateios: rateios.length,
                total_despesas_com_rateio: despesasSet.size,
                setores: setoresFormatados.sort((a, b) => b.total - a.total)
            }
        });
    } catch (error) {
        console.error('❌ Erro em getRateioStats:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};