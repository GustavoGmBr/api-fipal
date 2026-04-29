import { PrismaClient } from '@prisma/client';
import ftpService from '../services/ftpService.js'; // Ajuste o caminho se necessário

const prisma = new PrismaClient();

export const criar = async (req, res) => {
  try {
    const dados = req.body;
    const files = req.files;

    let urlCorpo = null;
    let urlRosto = null;

    // 1. Upload da Imagem de Corpo via FTP
    if (files?.corpo) {
      const nomeLimpo = dados.nome.replace(/\s+/g, '_');
      urlCorpo = await ftpService.uploadFile(files.corpo[0], 'personagens', `${nomeLimpo}_Corpo`);
    }

    // 2. Upload da Imagem de Rosto via FTP
    if (files?.rosto) {
      const nomeLimpo = dados.nome.replace(/\s+/g, '_');
      urlRosto = await ftpService.uploadFile(files.rosto[0], 'personagens', `${nomeLimpo}_Rosto`);
    }

    // 3. Salva no Banco com as URLs da HostGator
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
    console.error("Erro ao criar personagem:", error);
    res.status(400).json({ error: "Erro ao processar cadastro e upload", detalhes: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    const files = req.files;

    const updateData = { ...dados };
    const nomeLimpo = dados.nome ? dados.nome.replace(/\s+/g, '_') : 'Personagem';

    if (files?.corpo) {
      updateData.imagemCorpo = await ftpService.uploadFile(files.corpo[0], 'personagens', `${nomeLimpo}_Corpo`);
    }
    if (files?.rosto) {
      updateData.imagemRosto = await ftpService.uploadFile(files.rosto[0], 'personagens', `${nomeLimpo}_Rosto`);
    }

    const atualizado = await prisma.personagens.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar personagem:", error);
    res.status(400).json({ error: "Erro ao atualizar cadastro e upload" });
  }
};

export const listar = async (req, res) => {
  try {
    const lista = await prisma.personagens.findMany({ orderBy: { nome: 'asc' } });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar" });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const personagem = await prisma.personagens.findUnique({ where: { id: parseInt(id) } });
    if (!personagem) return res.status(404).json({ error: "Não encontrado" });
    res.json(personagem);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar" });
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