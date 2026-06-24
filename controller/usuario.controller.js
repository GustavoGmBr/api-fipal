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
    const { login, senha, nome, email, contato, nivel_acesso, foto } = req.body;
    
    // Modificado para incluir a criação do perfil de jogo acoplada
    const usuario = await prisma.usuario.create({ 
      data: { 
        login, 
        senha, 
        nome, 
        email, 
        contato, 
        nivel_acesso, 
        foto,
        // Cria automaticamente a carteira de jogos zerada para o novo usuário
        jogo: {
          create: {
            valor_moedas: 100.00,
            valor_total_ganho: 0.00,
            valor_total_perdido: 0.00,
            vezes_resetadas: 0,
            estatisticas_jogos: [] // Inicializa o campo JSON como um array vazio
          }
        }
      },
      // Opcional: Inclui os dados do jogo recém-criado na resposta da API
      include: {
        jogo: true
      }
    });

    return res.status(201).json({ success: true, data: usuario });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { login, senha, nome, email, contato, nivel_acesso, foto } = req.body;
    
    const data = {};
    if (login !== undefined) data.login = login;
    if (senha !== undefined) data.senha = senha;
    if (nome !== undefined) data.nome = nome;
    if (email !== undefined) data.email = email;
    if (contato !== undefined) data.contato = contato;
    if (nivel_acesso !== undefined) data.nivel_acesso = nivel_acesso;

    if (foto !== undefined) {
      const usuarioAtual = await prisma.usuario.findUnique({
        where: { id_usuario: Number(id) },
        select: { foto: true },
      });

      if (usuarioAtual?.foto && usuarioAtual.foto !== foto) {
        try {
          deleteFotoUsuario(usuarioAtual.foto);
        } catch (err) {
          console.warn(`⚠️ Não foi possível deletar foto antiga: ${err.message}`);
        }
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

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: Number(id) },
      select: { foto: true },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    if (usuario.foto) {
      deleteFotoUsuario(usuario.foto);
    }

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