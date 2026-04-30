import { PrismaClient } from '@prisma/client';
import ftpService from '../services/ftp.service.js';

const prisma = new PrismaClient();

// ✅ ADICIONADO: Função para listar todos os personagens
export const listar = async (req, res) => {
  try {
    const personagens = await prisma.personagens.findMany({
      include: {
        historicos: {
          orderBy: { criado_em: 'desc' },
          take: 1,
          include: { raca: true }
        }
      },
      orderBy: { nome: 'asc' }
    });
    res.json(personagens);
  } catch (error) {
    console.error("Erro ao listar personagens:", error);
    res.status(500).json({ error: "Erro ao carregar lista de personagens" });
  }
};

export const criar = async (req, res) => {
  try {
    const dados = req.body;
    const files = req.files;

    if (!dados.nome) {
      return res.status(400).json({ error: "O nome é obrigatório." });
    }

    let urlCorpo = null;
    let urlRosto = null;

    if (files) {
      const nomeLimpo = dados.nome.replace(/\s+/g, '_');
      if (files.corpo) urlCorpo = await ftpService.uploadFile(files.corpo[0], 'personagens', `${nomeLimpo}_Corpo`);
      if (files.rosto) urlRosto = await ftpService.uploadFile(files.rosto[0], 'personagens', `${nomeLimpo}_Rosto`);
    }

    // ✅ Mapeamento completo dos campos biográficos
    const novoPersonagem = await prisma.personagens.create({
      data: {
        nome: dados.nome,
        titulo: dados.titulo,
        classe: dados.classe,
        afiliacao: dados.afiliacao,
        altura: dados.altura,
        peso: dados.peso,
        tipo_corporal: dados.tipo_corporal,
        tipo_cabelo: dados.tipo_cabelo,
        cor_cabelo: dados.cor_cabelo,
        olhos: dados.olhos,
        olhos_especiais: dados.olhos_especiais,
        tom_voz: dados.tom_voz,
        traje_combate: dados.traje_combate,
        traje_casual: dados.traje_casual,
        armamento_principal: dados.armamento_principal,
        virtude: dados.virtude,
        defeito: dados.defeito,
        temperamento: dados.temperamento,
        imagemCorpo: urlCorpo,
        imagemRosto: urlRosto
      }
    });

    res.status(201).json(novoPersonagem);
  } catch (error) {
    console.error("ERRO PRISMA DETALHADO:", error);
    res.status(400).json({ error: "Erro ao criar personagem", detalhes: error.message });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const personagem = await prisma.personagens.findUnique({
      where: { id: parseInt(id) },
      include: {
        historicos: {
          orderBy: { criado_em: 'desc' },
          take: 1,
          include: { raca: true }
        }
      }
    });
    if (!personagem) return res.status(404).json({ error: "Não encontrado" });
    res.json(personagem);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar detalhes" });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    const files = req.files;
    const atual = await prisma.personagens.findUnique({ where: { id: parseInt(id) } });
    let urlCorpo = atual.imagemCorpo;
    let urlRosto = atual.imagemRosto;

    if (files) {
      const nomeLimpo = dados.nome.replace(/\s+/g, '_');
      if (files.corpo) urlCorpo = await ftpService.uploadFile(files.corpo[0], 'personagens', `${nomeLimpo}_Corpo`);
      if (files.rosto) urlRosto = await ftpService.uploadFile(files.rosto[0], 'personagens', `${nomeLimpo}_Rosto`);
    }

    const atualizado = await prisma.personagens.update({
      where: { id: parseInt(id) },
      data: { ...dados, imagemCorpo: urlCorpo, imagemRosto: urlRosto }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar" });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.personagens.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar" });
  }
};