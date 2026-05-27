import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginSchema, createUsuarioSchema, updateUsuarioSchema } from '../validators/authValidator.js';

const prisma = new PrismaClient();

// ==========================================
// 1. LOGIN
// ==========================================
export const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.flatten().fieldErrors });

    const { login, senha } = result.data;

    const usuario = await prisma.usuarios.findUnique({ where: { login } });
    if (!usuario) return res.status(401).json({ message: "Credenciais inválidas." });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ message: "Credenciais inválidas." });

    const token = jwt.sign(
      { id: usuario.id_usuario, nivel_acesso: usuario.nivel_acesso },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      usuario: { id: usuario.id_usuario, login: usuario.login, nivel_acesso: usuario.nivel_acesso }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// ==========================================
// 2. OBTER DADOS DO USUÁRIO LOGADO (ME)
// ==========================================
export const me = async (req, res) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: req.userId },
      select: { id_usuario: true, login: true, nivel_acesso: true, data_criacao: true }
    });
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado." });
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// ==========================================
// 3. CADASTRO DE USUÁRIO (CREATE)
// ==========================================
export const cadastro = async (req, res) => {
  try {
    const result = createUsuarioSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    const { login, senha, nivel_acesso } = result.data;

    // Verifica se o login já existe
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { login } });
    if (usuarioExistente) {
      return res.status(409).json({ message: "Este login já está em uso." });
    }

    // Criptografa a senha
    const hashSenha = await bcrypt.hash(senha, 10);

    // Cria no banco
    const novoUsuario = await prisma.usuarios.create({
      data: {
        login,
        senha: hashSenha,
        nivel_acesso
      },
      select: { id_usuario: true, login: true, nivel_acesso: true, data_criacao: true }
    });

    return res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// ==========================================
// 4. EDIÇÃO DE USUÁRIO (UPDATE)
// ==========================================
export const editar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = updateUsuarioSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    const idUsuario = parseInt(id, 10);
    if (isNaN(idUsuario)) return res.status(400).json({ message: "ID inválido." });

    // Verifica se o usuário existe
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id_usuario: idUsuario } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado." });

    const dadosAtualizados = { ...result.data };

    // Se ele enviou uma nova senha, precisamos gerar o hash dela
    if (dadosAtualizados.senha) {
      dadosAtualizados.senha = await bcrypt.hash(dadosAtualizados.senha, 10);
    }

    // Se alterou o login, verifica se o novo já não pertence a outra pessoa
    if (dadosAtualizados.login && dadosAtualizados.login !== usuarioExistente.login) {
      const loginEmUso = await prisma.usuarios.findUnique({ where: { login: dadosAtualizados.login } });
      if (loginEmUso) return res.status(409).json({ message: "Este login já está em uso por outro usuário." });
    }

    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id_usuario: idUsuario },
      data: dadosAtualizados,
      select: { id_usuario: true, login: true, nivel_acesso: true }
    });

    return res.status(200).json({ message: "Usuário atualizado com sucesso!", usuario: usuarioAtualizado });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// ==========================================
// 5. EXCLUSÃO DE USUÁRIO (DELETE)
// ==========================================
export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = parseInt(id, 10);

    if (isNaN(idUsuario)) return res.status(400).json({ message: "ID inválido." });

    // Regra de segurança: impede que o usuário delete a si mesmo logado
    if (idUsuario === req.userId) {
      return res.status(400).json({ message: "Você não pode excluir sua própria conta enquanto estiver logado." });
    }

    const usuarioExistente = await prisma.usuarios.findUnique({ where: { id_usuario: idUsuario } });
    if (!usuarioExistente) return res.status(404).json({ message: "Usuário não encontrado." });

    await prisma.usuarios.delete({ where: { id_usuario: idUsuario } });

    return res.status(200).json({ message: "Usuário excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};