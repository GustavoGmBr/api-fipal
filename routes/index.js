import express from 'express';
const router = express.Router();

import * as authController from '../controllers/auth.controller.js';
import * as racaController from '../controllers/raca.controller.js';
import * as sistemaController from '../controllers/sistema.controller.js';
import * as personagemController from '../controllers/personagem.controller.js';
import * as historicoController from '../controllers/historico.controller.js';
import * as livroController from '../controllers/livro.controller.js';
import * as capituloController from '../controllers/capitulo.controller.js';

import { uploadPersonagem } from '../middlewares/upload.js';
import authMiddleware from '../middlewares/auth.middleware.js';

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.login);

// Raças e Sistemas
router.get('/racas', racaController.listarTodos);
router.get('/racas/:id', racaController.buscarPorId);
router.get('/sistemas', sistemaController.listarTodos);
router.get('/sistemas/:id', sistemaController.buscarPorId);

// Personagens
router.get('/personagens', personagemController.listar);
router.get('/personagens/:id', personagemController.buscarPorId);

// Históricos
router.get('/historicos/:personagemId', historicoController.listarPorPersonagem);
router.get('/historicos/detalhes/:id', historicoController.buscarPorId); // ✅ ADICIONADO
// Livros e Capítulos
router.get('/livros', livroController.listarTodos);
router.get('/capitulos/livro/:livroId', capituloController.listarPorLivro);

// --- ROTAS PROTEGIDAS ---
router.use(authMiddleware);

// CRUD de Personagens, Raças, Sistemas e Históricos...
router.post('/personagens', uploadPersonagem, personagemController.criar);
router.put('/personagens/:id', uploadPersonagem, personagemController.atualizar);
router.delete('/personagens/:id', personagemController.deletar);

router.post('/historicos', historicoController.criar);
router.put('/historicos/:id', historicoController.atualizar);
router.delete('/historicos/:id', historicoController.deletar);

export default router;
