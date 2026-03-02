import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const saltRounds = 10

export const usuarioController = {
  async listarTodos(req, res) {
    try {
      // ✅ tb_usuario → usuarios
      const usuarios = await prisma.usuarios.findMany({
        select: { id_usuario: true, login: true, nivel_acesso: true, data_criacao: true }
      })
      res.status(200).json(usuarios)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários', details: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const usuario = await prisma.usuarios.findUnique({
        where: { id_usuario: parseInt(req.params.id) },
        select: { id_usuario: true, login: true, nivel_acesso: true, data_criacao: true }
      })
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' })
      res.status(200).json(usuario)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message })
    }
  },

  async criar(req, res) {
    try {
      const { login, senha, nivel_acesso } = req.body
      const hashedSenha = await bcrypt.hash(senha, saltRounds)
      const novoUsuario = await prisma.usuarios.create({
        data: { login, senha: hashedSenha, nivel_acesso }
      })
      const { senha: _, ...usuarioSemSenha } = novoUsuario
      res.status(201).json(usuarioSemSenha)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar usuário', details: error.message })
    }
  },

  async atualizar(req, res) {
    try {
      const { login, senha, nivel_acesso } = req.body
      const updateData = { login, nivel_acesso }
      if (senha) updateData.senha = await bcrypt.hash(senha, saltRounds)
      const atualizado = await prisma.usuarios.update({
        where: { id_usuario: parseInt(req.params.id) },
        data: updateData
      })
      const { senha: _, ...usuarioSemSenha } = atualizado
      res.status(200).json(usuarioSemSenha)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message })
    }
  },

  async deletar(req, res) {
    try {
      await prisma.usuarios.delete({ where: { id_usuario: parseInt(req.params.id) } })
      res.status(200).json({ message: 'Usuário deletado com sucesso' })
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar usuário', details: error.message })
    }
  }
}