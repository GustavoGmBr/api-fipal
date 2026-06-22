import prisma from '../lib/prisma.js';

export const readAll = async (req, res) => {
  try {
    const { desc_categoria } = req.query;
    const where = desc_categoria ? { desc_categoria: { contains: desc_categoria } } : {};
    const categorias = await prisma.categoria_Pedido.findMany({
      where,
      orderBy: { id_categoria: 'desc' }
    });
    res.status(200).json({ success: true, data: categorias });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const categoria = await prisma.categoria_Pedido.findUnique({ where: { id_categoria: id } });
    if (!categoria) return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    res.status(200).json({ success: true, data: categoria });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { cod_categoria, desc_categoria } = req.body;
    const novaCategoria = await prisma.categoria_Pedido.create({
      data: { cod_categoria, desc_categoria }
    });
    res.status(201).json({ success: true, data: novaCategoria });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cod_categoria, desc_categoria } = req.body;
    const categoriaAtualizada = await prisma.categoria_Pedido.update({
      where: { id_categoria: id },
      data: { cod_categoria, desc_categoria }
    });
    res.status(200).json({ success: true, data: categoriaAtualizada });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const categoriaExistente = await prisma.categoria_Pedido.findUnique({ where: { id_categoria: id } });
    if (!categoriaExistente) return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    await prisma.categoria_Pedido.delete({ where: { id_categoria: id } });
    res.status(200).json({ success: true, data: 'Categoria removida com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};