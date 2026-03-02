import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany()
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
}

export async function criarUsuario(req, res) {
  try {
    const { nome, email, senha } = req.body
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha }
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
}