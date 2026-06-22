import prisma from '../lib/prisma.js';

export const readAll = async (req, res) => {
  try {
    const { marca, modelo, placa, chassi } = req.query;

    const where = {};

    if (marca) {
      where.marca = {
        contains: marca,
      };
    }

    if (modelo) {
      where.modelo = {
        contains: modelo,
      };
    }

    if (placa) {
      where.placa = {
        contains: placa,
      };
    }

    if (chassi) {
      where.chassi = {
        contains: chassi,
      };
    }

    const testDrives = await prisma.testDrive.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return res.json({ success: true, data: testDrives });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const testDrive = await prisma.testDrive.findUnique({
      where: { id_testdrive: Number(id) },
    });

    if (!testDrive) {
      return res.status(404).json({ success: false, error: 'Veículo de test drive não encontrado' });
    }

    return res.json({ success: true, data: testDrive });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { marca, modelo, ano, cor, placa, chassi, renavam } = req.body;

    const testDrive = await prisma.testDrive.create({
      data: { marca, modelo, ano, cor, placa, chassi, renavam },
    });

    return res.status(201).json({ success: true, data: testDrive });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, ano, cor, placa, chassi, renavam } = req.body;

    const data = {};
    if (marca !== undefined) data.marca = marca;
    if (modelo !== undefined) data.modelo = modelo;
    if (ano !== undefined) data.ano = ano;
    if (cor !== undefined) data.cor = cor;
    if (placa !== undefined) data.placa = placa;
    if (chassi !== undefined) data.chassi = chassi;
    if (renavam !== undefined) data.renavam = renavam;

    const testDrive = await prisma.testDrive.update({
      where: { id_testdrive: Number(id) },
      data,
    });

    return res.json({ success: true, data: testDrive });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const testDrive = await prisma.testDrive.findUnique({
      where: { id_testdrive: Number(id) },
    });

    if (!testDrive) {
      return res.status(404).json({ success: false, error: 'Veículo de test drive não encontrado' });
    }

    await prisma.testDrive.delete({ where: { id_testdrive: Number(id) } });

    return res.json({ success: true, message: 'Veículo de test drive removido' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};