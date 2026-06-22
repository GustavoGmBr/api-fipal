import prisma from '../lib/prisma.js';

export const readAll = async (req, res) => {
  try {
    const { cliente, chassi } = req.query;

    const where = {};

    if (cliente) {
      where.cliente = {
        contains: cliente,
      };
    }

    if (chassi) {
      where.chassi = {
        contains: chassi,
      };
    }

    const tradeins = await prisma.tradein.findMany({
      where,
      orderBy: { data_tradein: 'desc' },
    });

    return res.json({ success: true, data: tradeins });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const tradein = await prisma.tradein.findUnique({
      where: { id_tradein: Number(id) },
    });
    if (!tradein) {
      return res.status(404).json({ success: false, error: 'Tradein não encontrado' });
    }
    return res.json({ success: true, data: tradein });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { cliente, chassi, codigo, valor, data_tradein } = req.body;
    const data = { cliente, chassi, codigo, valor };
    if (data_tradein !== undefined) data.data_tradein = new Date(data_tradein);

    const tradein = await prisma.tradein.create({ data });
    return res.status(201).json({ success: true, data: tradein });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, chassi, codigo, valor, data_tradein } = req.body;
    const data = {};
    if (cliente !== undefined) data.cliente = cliente;
    if (chassi !== undefined) data.chassi = chassi;
    if (codigo !== undefined) data.codigo = codigo;
    if (valor !== undefined) data.valor = valor;
    if (data_tradein !== undefined) data.data_tradein = new Date(data_tradein);

    const tradein = await prisma.tradein.update({
      where: { id_tradein: Number(id) },
      data,
    });
    return res.json({ success: true, data: tradein });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const tradein = await prisma.tradein.findUnique({
      where: { id_tradein: Number(id) },
    });

    if (!tradein) {
      return res.status(404).json({ success: false, error: 'Tradein não encontrado' });
    }

    await prisma.tradein.delete({ where: { id_tradein: Number(id) } });

    return res.json({ success: true, message: 'Tradein removido' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};