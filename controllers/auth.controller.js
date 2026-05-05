import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { loginSchema } from '../validator/auth.validator.js';
import { ZodError } from 'zod';

const login = async (req, res) => {
  try {
    // 1. Validação dos dados de entrada
    const { login: usuarioLogin, senha } = loginSchema.parse(req.body);

    // 2. Busca o usuário no banco
    const usuario = await prisma.usuarios.findUnique({
      where: { login: usuarioLogin },
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        senha: true,
      },
    });

    // 3. Verifica se usuário existe e se a senha bate
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // 4. Verificação de Segurança: JWT_SECRET
    // Se não houver secret no .env, o login vai falhar com erro 500
    if (!process.env.JWT_SECRET) {
      console.error("❌ ERRO CRÍTICO: JWT_SECRET não definido nas variáveis de ambiente.");
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        debug: 'Configuração de segurança pendente no servidor.' 
      });
    }

    // 5. Geração do Token
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nivel_acesso: usuario.nivel_acesso,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 6. Resposta de sucesso
    return res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        login: usuario.login,
        nivel_acesso: usuario.nivel_acesso,
      },
    });

  } catch (error) {
    // Log detalhado no console do Render para diagnóstico
    console.error("❌ Erro no processo de login:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Dados de login inválidos',
        errors: error.issues.map((issue) => issue.message),
      });
    }

    // Retornamos a mensagem do erro original para ajudar você a identificar no Postman
    // se é um erro de banco de dados ou de código.
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

export default { login };