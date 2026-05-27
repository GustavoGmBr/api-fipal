import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../validator/auth.validator';

const prisma = new PrismaClient();

export const login = async (req, res) => {
  try {
    // 1. Valida os dados de entrada usando o Zod Schema
    const result = loginSchema.safeParse(req.body);
    
    if (!result.success) {
      // Retorna os erros de validação formatados do Zod
      return res.status(400).json({ 
        errors: result.error.flatten().fieldErrors 
      });
    }

    const { login, senha } = result.data;

    // 2. Busca o usuário no banco de dados
    const usuario = await prisma.usuarios.findUnique({
      where: { login }
    });

    if (!usuario) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 3. Compara a senha enviada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 4. Gera o Token JWT (expira em 8 horas, ajuste se necessário)
    const token = jwt.sign(
      { 
        id: usuario.id_usuario, 
        nivel_acesso: usuario.nivel_acesso 
      },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '8h' }
    );

    // 5. Retorna o token e os dados públicos do usuário
    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id_usuario,
        login: usuario.login,
        nivel_acesso: usuario.nivel_acesso
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// Função para retornar os dados do usuário autenticado (útil para o React carregar o perfil)
export const me = async (req, res) => {
  try {
    // O id_usuario virá do middleware de autenticação (que faremos a seguir)
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: req.userId },
      select: {
        id_usuario: true,
        login: true,
        nivel_acesso: true,
        data_criacao: true
      }
    });

    if (!usuario) {
      return res.status(44).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};