import prisma from '../lib/prisma.js';
import { deletePericiaUsado, deleteFotosUsado } from '../utils/deleteFiles.js';

export const readAll = async (req, res) => {
  try {
    const usados = await prisma.usado.findMany();
    return res.json({ success: true, data: usados });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const usado = await prisma.usado.findUnique({ where: { id_usado: Number(id) } });
    if (!usado) return res.status(404).json({ success: false, error: 'Usado não encontrado' });
    return res.json({ success: true, data: usado });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      marca, modelo, ano, cor, placa, km_atual, combustivel,
      pintura_metalica, direcao, teto_solar, ar_condicionado,
      trava_eletrica, retrovisor_eletrico, multimidia, alarme,
      rodas_liga_leve, valor_fipe, valor_venda, observacao,
      codigoFipe, pericia, fotos, created_by
    } = req.body;

    const data = {
      marca, modelo, ano: Number(ano), cor, placa,
      km_atual: Number(km_atual), combustivel,
      pintura_metalica: !!pintura_metalica, direcao,
      teto_solar: !!teto_solar, ar_condicionado: !!ar_condicionado,
      trava_eletrica: !!trava_eletrica, retrovisor_eletrico: !!retrovisor_eletrico,
      multimidia: !!multimidia, alarme: !!alarme, rodas_liga_leve: !!rodas_liga_leve,
      valor_fipe: Number(valor_fipe) || 0,
      valor_venda: valor_venda ? Number(valor_venda) : null,
      observacao, codigoFipe,
      pericia: pericia || null,
      fotos: fotos || null,
      created_by
    };

    const novoUsado = await prisma.usado.create({ data });
    return res.status(201).json({ success: true, data: novoUsado });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      marca, modelo, ano, cor, placa, km_atual, combustivel,
      pintura_metalica, direcao, teto_solar, ar_condicionado,
      trava_eletrica, retrovisor_eletrico, multimidia, alarme,
      rodas_liga_leve, valor_fipe, valor_venda, observacao,
      codigoFipe, pericia, fotos, updated_by
    } = req.body;

    const data = {};
    if (marca !== undefined) data.marca = marca;
    if (modelo !== undefined) data.modelo = modelo;
    if (ano !== undefined) data.ano = Number(ano);
    if (cor !== undefined) data.cor = cor;
    if (placa !== undefined) data.placa = placa;
    if (km_atual !== undefined) data.km_atual = Number(km_atual);
    if (combustivel !== undefined) data.combustivel = combustivel;
    if (pintura_metalica !== undefined) data.pintura_metalica = !!pintura_metalica;
    if (direcao !== undefined) data.direcao = direcao;
    if (teto_solar !== undefined) data.teto_solar = !!teto_solar;
    if (ar_condicionado !== undefined) data.ar_condicionado = !!ar_condicionado;
    if (trava_eletrica !== undefined) data.trava_eletrica = !!trava_eletrica;
    if (retrovisor_eletrico !== undefined) data.retrovisor_eletrico = !!retrovisor_eletrico;
    if (multimidia !== undefined) data.multimidia = !!multimidia;
    if (alarme !== undefined) data.alarme = !!alarme;
    if (rodas_liga_leve !== undefined) data.rodas_liga_leve = !!rodas_liga_leve;
    if (valor_fipe !== undefined) data.valor_fipe = Number(valor_fipe);
    if (valor_venda !== undefined) data.valor_venda = valor_venda ? Number(valor_venda) : null;
    if (observacao !== undefined) data.observacao = observacao;
    if (codigoFipe !== undefined) data.codigoFipe = codigoFipe;
    if (updated_by !== undefined) data.updated_by = updated_by;

    // Perícia
    if (pericia !== undefined) {
      const atual = await prisma.usado.findUnique({
        where: { id_usado: Number(id) },
        select: { pericia: true }
      });
      if (atual?.pericia && atual.pericia !== pericia) {
        try { deletePericiaUsado(atual.pericia); } catch (e) { console.warn(e.message); }
      }
      data.pericia = pericia;
    }

    // Fotos
    if (fotos !== undefined) {
      const atual = await prisma.usado.findUnique({
        where: { id_usado: Number(id) },
        select: { fotos: true }
      });
      if (atual?.fotos?.length && JSON.stringify(atual.fotos) !== JSON.stringify(fotos)) {
        try { deleteFotosUsado(atual.fotos); } catch (e) { console.warn(e.message); }
      }
      data.fotos = fotos;
    }

    const usado = await prisma.usado.update({
      where: { id_usado: Number(id) },
      data,
    });
    return res.json({ success: true, data: usado });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const usado = await prisma.usado.findUnique({
      where: { id_usado: Number(id) },
      select: { pericia: true, fotos: true, placa: true },
    });
    if (!usado) return res.status(404).json({ success: false, error: 'Usado não encontrado' });

    if (usado.pericia) {
      try { deletePericiaUsado(usado.pericia); } catch (e) { console.warn(e.message); }
    }
    if (usado.fotos?.length > 0) {
      try { deleteFotosUsado(usado.fotos); } catch (e) { console.warn(e.message); }
    }

    await prisma.usado.delete({ where: { id_usado: Number(id) } });
    return res.json({ success: true, message: 'Usado removido' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};