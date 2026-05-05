import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { loginSchema } from '../validator/auth.validator.js';
import { ZodError } from 'zod';

const login = async (req, res) => {
  try {
    const { login: usuarioLogin, senha } = loginSchema.parse(req.body);

    const usuario = await prisma.usuarios.findUnique({
      where: { login: usuarioLogin },
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        senha: true,
      },
    });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nivel_acesso: usuario.nivel_acesso,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        login: usuario.login,
        nivel_acesso: usuario.nivel_acesso,
      },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Dados de login inválidos',
        errors: error.issues.map((issue) => issue.message),
      });
    }
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export default { login };