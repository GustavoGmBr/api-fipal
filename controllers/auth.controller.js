import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const authController = {
  async login(req, res) {
    try {
      const { login, senha } = req.body

      if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios' })
      }

      // ✅ tb_usuario → usuarios
      const usuario = await prisma.usuarios.findUnique({
        where: { login }
      })

      if (!usuario) {
        return res.status(401).json({ error: 'Login ou senha inválidos' })
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha)

      if (!senhaValida) {
        return res.status(401).json({ error: 'Login ou senha inválidos' })
      }

      const token = jwt.sign(
        {
          id:           usuario.id_usuario,
          login:        usuario.login,
          nivel_acesso: usuario.nivel_acesso
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      return res.status(200).json({
        token,
        usuario: {
          id:           usuario.id_usuario,
          login:        usuario.login,
          nivel_acesso: usuario.nivel_acesso
        }
      })

    } catch (error) {
      return res.status(500).json({ error: 'Erro interno', details: error.message })
    }
  },

  async me(req, res) {
    return res.status(200).json({ usuario: req.usuario })
  }
}