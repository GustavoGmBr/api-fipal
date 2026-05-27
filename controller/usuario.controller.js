import prisma from '../lib/prisma.js';
import { deleteFotoUsuario } from '../utils/deleteFiles.js';

export const readAll = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    return res.json({ success: true, data: usuarios });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id) },
    });
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    return res.json({ success: true, data: usuario });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { login, senha, nome, nivel_acesso, foto } = req.body;
    const data = { login, senha, nome, nivel_acesso, foto };
    const usuario = await prisma.usuario.create({ data });
    return res.status(201).json({ success: true, data: usuario });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { login, senha, nome, nivel_acesso, foto } = req.body;
    const data = {};
    if (login !== undefined) data.login = login;
    if (senha !== undefined) data.senha = senha;
    if (nome !== undefined) data.nome = nome;
    if (nivel_acesso !== undefined) data.nivel_acesso = nivel_acesso;

    // Se uma nova foto for enviada, deleta a antiga antes de atualizar
    if (foto !== undefined) {
      const usuarioAtual = await prisma.usuario.findUnique({
        where: { id_usuario: Number(id) },
        select: { foto: true },
      });

      if (usuarioAtual?.foto) {
        deleteFotoUsuario(usuarioAtual.foto);
      }

      data.foto = foto;
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario: Number(id) },
      data,
    });
    return res.json({ success: true, data: usuario });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o usuário antes de deletar para pegar a foto
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id) },
      select: { foto: true, nome: true },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    // Deleta a foto do disco se existir
    if (usuario.foto) {
      deleteFotoUsuario(usuario.foto);
    }

    // Deleta o registro no banco
    await prisma.usuario.delete({ where: { id_usuario: Number(id) } });

    return res.json({ success: true, message: 'Usuário removido' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { login, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { login } });
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
    return res.json({ success: true, data: usuario });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};