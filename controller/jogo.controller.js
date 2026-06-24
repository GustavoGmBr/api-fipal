import prisma from '../lib/prisma.js';

// --- CRUD BÁSICO ---

export const readAll = async (req, res) => {
  try {
    const { id_usuario, min_moedas, max_moedas, vezes_resetadas } = req.query;

    const where = {};
    if (id_usuario) where.id_usuario = Number(id_usuario);
    
    // Filtros de intervalo para moedas
    if (min_moedas || max_moedas) {
      where.valor_moedas = {};
      if (min_moedas) where.valor_moedas.gte = Number(min_moedas);
      if (max_moedas) where.valor_moedas.lte = Number(max_moedas);
    }
    
    if (vezes_resetadas) where.vezes_resetadas = Number(vezes_resetadas);

    const jogos = await prisma.jogo.findMany({
      where,
      include: {
        usuario: {
          select: { nome: true, login: true, email: true } // Inclui dados básicos do usuário associado
        }
      },
      orderBy: { valor_moedas: 'desc' } // Ranking dos que têm mais moedas por padrão
    });

    return res.json({ success: true, data: jogos });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const jogo = await prisma.jogo.findUnique({
      where: { id_jogo: Number(id) },
      include: {
        usuario: {
          select: { nome: true, login: true }
        }
      }
    });
    if (!jogo) return res.status(404).json({ success: false, error: 'Registro de jogo não encontrado' });
    return res.json({ success: true, data: jogo });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { id_usuario, valor_moedas, valor_total_ganho, valor_total_perdido, vezes_resetadas, estatisticas_jogos } = req.body;
    
    const novoJogo = await prisma.jogo.create({
      data: {
        id_usuario: Number(id_usuario),
        valor_moedas: Number(valor_moedas || 0),
        valor_total_ganho: Number(valor_total_ganho || 0),
        valor_total_perdido: Number(valor_total_perdido || 0),
        vezes_resetadas: Number(vezes_resetadas || 0),
        estatisticas_jogos: estatisticas_jogos || [] // Armazena o array JSON diretamente
      }
    });
    return res.status(201).json({ success: true, data: novoJogo });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_moedas, valor_total_ganho, valor_total_perdido, vezes_resetadas, estatisticas_jogos } = req.body;
    
    const data = {};
    if (valor_moedas !== undefined) data.valor_moedas = Number(valor_moedas);
    if (valor_total_ganho !== undefined) data.valor_total_ganho = Number(valor_total_ganho);
    if (valor_total_perdido !== undefined) data.valor_total_perdido = Number(valor_total_perdido);
    if (vezes_resetadas !== undefined) data.vezes_resetadas = Number(vezes_resetadas);
    if (estatisticas_jogos !== undefined) data.estatisticas_jogos = estatisticas_jogos;

    const jogoAtualizado = await prisma.jogo.update({
      where: { id_jogo: Number(id) },
      data
    });
    return res.json({ success: true, data: jogoAtualizado });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jogo.delete({ where: { id_jogo: Number(id) } });
    return res.json({ success: true, message: 'Registro de jogo removido com sucesso' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// --- MÉTODOS ANALÍTICOS (DASHBOARD) ---
export const resetarBanca = async (req, res) => {
  try {
    const { id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ success: false, error: 'O ID do usuário é obrigatório.' });
    }

    // 1. Busca o registro atual do jogo daquele usuário
    const jogoAtual = await prisma.jogo.findUnique({
      where: { id_usuario: Number(id_usuario) }
    });

    if (!jogoAtual) {
      return res.status(404).json({ success: false, error: 'Registro de jogo não encontrado para este usuário.' });
    }

    // 2. REGRA DE NEGÓCIO: Só pode resetar se a banca atual for menor ou igual a 0
    // (Se ele tiver moedas positivas, o reset é bloqueado)
    if (Number(jogoAtual.valor_moedas) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Você ainda possui ${jogoAtual.valor_moedas} moedas. O reset só é permitido se a banca estiver zerada ou negativa.` 
      });
    }

    // 3. Atualiza os dados no banco de dados
    const VALOR_RESET_PADRAO = 100.00; // Quantidade de moedas que a pessoa ganha ao resetar
    
    const jogoAtualizado = await prisma.jogo.update({
      where: { id_usuario: Number(id_usuario) },
      data: {
        valor_moedas: VALOR_RESET_PADRAO,
        vezes_resetadas: {
          increment: 1 // Soma +1 automaticamente no contador de resets do Prisma
        }
      }
    });

    return res.json({ 
      success: true, 
      message: 'Banca resetada com sucesso!', 
      data: jogoAtualizado 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
// Retorna o saldo global somado de moedas na plataforma e total de resets realizados
export const getDadosConsolidados = async (req, res) => {
  try {
    const agregacao = await prisma.jogo.aggregate({
      _sum: {
        valor_moedas: true,
        valor_total_ganho: true,
        valor_total_perdido: true,
        vezes_resetadas: true
      },
      _count: {
        id_jogo: true
      }
    });

    return res.json({
      success: true,
      data: {
        total_jogadores: agregacao._count.id_jogo,
        moedas_em_circulacao: Number(agregacao._sum.valor_moedas) || 0,
        global_ganho: Number(agregacao._sum.valor_total_ganho) || 0,
        global_perdido: Number(agregacao._sum.valor_total_perdido) || 0,
        total_resets: agregacao._sum.vezes_resetadas || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
// Retorna o relatório detalhado de um usuário específico por ID ou Login
export const getRelatorioPorUsuario = async (req, res) => {
  try {
    const { identificador } = req.params; // Pode ser o ID numérico ou o login do usuário

    // Verifica se o parâmetro passado é o ID (número) ou o login (string)
    const isId = !isNaN(identificador);

    const jogo = await prisma.jogo.findFirst({
      where: isId 
        ? { id_usuario: Number(identificador) } 
        : { usuario: { login: identificador } },
      include: {
        usuario: {
          select: { nome: true, login: true, email: true }
        }
      }
    });

    if (!jogo) {
      return res.status(404).json({ success: false, error: 'Relatório do usuário não encontrado' });
    }

    // Estrutura o relatório individualizado
    const relatorio = {
      usuario: {
        id: jogo.id_usuario,
        nome: jogo.usuario.nome,
        login: jogo.usuario.login,
        email: jogo.usuario.email
      },
      financeiro: {
        saldo_atual: Number(jogo.valor_moedas),
        total_ganho_historico: Number(jogo.valor_total_ganho),
        total_perdido_historico: Number(jogo.valor_total_perdido),
        saldo_liquido: Number(jogo.valor_total_ganho) - Number(jogo.valor_total_perdido),
        vezes_resetadas: jogo.vezes_resetadas
      },
      desempenho_por_jogo: jogo.estatisticas_jogos // Traz o array do JSON com os detalhes de cada jogo
    };

    return res.json({ success: true, data: relatorio });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
// Retorna um ranking (Top 10) baseado em maior volume de moedas ou maiores ganhos históricos
export const getTopJogadores = async (req, res) => {
  try {
    const { criterio } = req.query; // Pode filtrar por 'moedas' ou 'ganhos'
    
    const campoOrdenacao = criterio === 'ganhos' ? 'valor_total_ganho' : 'valor_moedas';

    const topJogadores = await prisma.jogo.findMany({
      take: 10,
      orderBy: { [campoOrdenacao]: 'desc' },
      include: {
        usuario: {
          select: { nome: true, login: true }
        }
      }
    });

    return res.json({ success: true, data: topJogadores });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};