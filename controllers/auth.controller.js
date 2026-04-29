import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { login, senha } = req.body;

  try {
    const usuario = await prisma.usuarios.findUnique({ 
      where: { login: login } 
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, nivel: usuario.nivel_acesso },
      process.env.JWT_SECRET || 'secret_7elemento',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        login: usuario.login,
        nivel: usuario.nivel_acesso
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};