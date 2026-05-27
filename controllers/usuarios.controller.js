import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { criarUsuarioSchema, atualizarUsuarioSchema } from '../validator/auth.validator.js';
import { ZodError } from 'zod';

async function criar(req, res) {
  try {
    const dados = criarUsuarioSchema.parse(req.body);
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = await prisma.usuarios.create({
      data: {
        login: dados.login,
        senha: senhaHash,
        nivel_acesso: dados.nivel_acesso,
      },
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        data_criacao: true,
      },
    });
    return res.status(201).json(usuario);
  } catch (erro) {
    if (erro instanceof ZodError) {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

async function listar(req, res) {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        data_criacao: true,
      },
    });
    return res.status(200).json(usuarios);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

async function obterPorId(req, res) {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: Number(id) },
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        data_criacao: true,
      },
    });
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    return res.status(200).json(usuario);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const dados = atualizarUsuarioSchema.parse(req.body);
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id_usuario: Number(id) },
    });
    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    const dadosAtualizar = {};
    if (dados.login) dadosAtualizar.login = dados.login;
    if (dados.senha) {
      dadosAtualizar.senha = await bcrypt.hash(dados.senha, 10);
    }
    if (dados.nivel_acesso) dadosAtualizar.nivel_acesso = dados.nivel_acesso;
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id_usuario: Number(id) },
      data: dadosAtualizar,
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        data_criacao: true,
      },
    });
    return res.status(200).json(usuarioAtualizado);
  } catch (erro) {
    if (erro instanceof ZodError) {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id_usuario: Number(id) },
    });
    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    await prisma.usuarios.delete({
      where: { id_usuario: Number(id) },
    });
    return res.status(204).send();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

export default { criar, listar, obterPorId, atualizar, deletar };