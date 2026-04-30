import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- 1. CRIAR NOVO REGISTRO DE HISTÓRICO ---
export const criar = async (req, res) => {
  try {
    const d = req.body;

    const novoHistorico = await prisma.personagem_historico.create({
      data: {
        // Relações obrigatórias usando connect
        personagem: { connect: { id: parseInt(d.personagem_id, 10) } },
        raca: { connect: { id: parseInt(d.raca_id, 10) } },
        
        // Relações opcionais
        ...(d.livro_id && { livro: { connect: { id: parseInt(d.livro_id, 10) } } }),
        ...(d.capitulo_id && { capitulo: { connect: { id: parseInt(d.capitulo_id, 10) } } }),

        // Atributos de Poder
        ponto_combate: parseInt(d.ponto_combate, 10) || 0,
        ponto_combateAetheris: parseInt(d.ponto_combateAetheris, 10) || 0,
        qtd_treino: parseInt(d.qtd_treino, 10) || 0,
        subnivel: parseInt(d.subnivel, 10) || 0,

        // Dados Narrativos (Strings)
        ranque: d.ranque ? String(d.ranque) : null,
        classificacao: d.classificacao || null,
        idade: d.idade ? String(d.idade) : null,
        titulo: d.titulo || null,
        classes: d.classes || null,
        estilo_luta: d.estilo_luta || null,
        maestria: d.maestria || null,

        // Dados Complexos (JSON)
        elementos: d.elementos || [],
        equipamento: d.equipamento || {}
      }
    });

    res.status(201).json(novoHistorico);
  } catch (error) {
    console.error("❌ ERRO AO CRIAR HISTÓRICO:", error);
    res.status(400).json({ error: "Erro ao salvar evolução", detalhes: error.message });
  }
};

// --- 2. ATUALIZAR REGISTRO EXISTENTE ---
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;

    const dadosAtualizados = {
      // Relações (Não atualizamos personagem_id por segurança)
      raca: { connect: { id: parseInt(d.raca_id, 10) } },
      
      ...(d.livro_id && { livro: { connect: { id: parseInt(d.livro_id, 10) } } }),
      ...(d.capitulo_id && { capitulo: { connect: { id: parseInt(d.capitulo_id, 10) } } }),

      // Atributos de Poder
      ponto_combate: parseInt(d.ponto_combate, 10) || 0,
      ponto_combateAetheris: parseInt(d.ponto_combateAetheris, 10) || 0,
      qtd_treino: parseInt(d.qtd_treino, 10) || 0,
      subnivel: parseInt(d.subnivel, 10) || 0,

      // Dados Narrativos
      ranque: d.ranque ? String(d.ranque) : null,
      classificacao: d.classificacao || null,
      idade: d.idade ? String(d.idade) : null,
      titulo: d.titulo || null,
      classes: d.classes || null,
      estilo_luta: d.estilo_luta || null,
      maestria: d.maestria || null,

      // Dados Complexos
      elementos: d.elementos || [],
      equipamento: d.equipamento || {}
    };

    const historico = await prisma.personagem_historico.update({
      where: { id: parseInt(id, 10) },
      data: dadosAtualizados
    });

    res.json(historico);
  } catch (error) {
    console.error("❌ ERRO AO ATUALIZAR HISTÓRICO:", error);
    res.status(400).json({ error: "Falha ao atualizar parâmetros de evolução", detalhes: error.message });
  }
};

// --- 3. BUSCAR POR ID (PARA EDIÇÃO NO FRONT) ---
export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const historico = await prisma.personagem_historico.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        livro: true,
        capitulo: true,
        raca: true
      }
    });

    if (!historico) return res.status(404).json({ error: "Registro não encontrado." });
    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar detalhes" });
  }
};

// --- 4. LISTAR POR PERSONAGEM (LINHA DO TEMPO) ---
export const listarPorPersonagem = async (req, res) => {
  try {
    const { personagemId } = req.params;

    const historicos = await prisma.personagem_historico.findMany({
      where: { personagem_id: parseInt(personagemId, 10) },
      include: {
        raca: true,
        livro: { select: { titulo: true } },
        capitulo: { select: { numero: true, titulo: true } }
      },
      orderBy: { criado_em: 'desc' }
    });

    res.json(historicos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar linha do tempo" });
  }
};

// --- 5. DELETAR REGISTRO ---
export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.personagem_historico.delete({
      where: { id: parseInt(id, 10) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Erro ao remover registro" });
  }
};