import express from 'express';
const router = express.Router();

import * as authController from '../controllers/auth.controller.js';
import * as racaController from '../controllers/raca.controller.js';
import * as sistemaController from '../controllers/sistema.controller.js';
import * as personagemController from '../controllers/personagem.controller.js'; // ✅ ADICIONADO
import { uploadPersonagem } from '../middlewares/upload.js'; // ✅ ADICIONADO (para as fotos)
import authMiddleware from '../middlewares/auth.middleware.js';

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.login);

// Listagem pública (útil para calculadoras e visualização)
router.get('/racas', racaController.listarTodos);
router.get('/racas/:id', racaController.buscarPorId);
router.get('/sistemas', sistemaController.listarTodos);
router.get('/sistemas/:id', sistemaController.buscarPorId);

// Personagens (Listagem e Detalhes são públicos)
router.get('/personagens', personagemController.listar); // ✅ ADICIONADO
router.get('/personagens/:id', personagemController.buscarPorId); // ✅ ADICIONADO

// --- ROTAS PROTEGIDAS (GERENCIAMENTO ADMIN) ---
// Todas as rotas abaixo deste middleware exigem token JWT
router.use(authMiddleware);

// CRUD de Raças
router.post('/racas', racaController.criar);
router.put('/racas/:id', racaController.atualizar);
router.delete('/racas/:id', racaController.deletar);

// CRUD de Sistemas
router.post('/sistemas', sistemaController.criar);
router.put('/sistemas/:id', sistemaController.atualizar);
router.delete('/sistemas/:id', sistemaController.deletar);

// CRUD de Personagens (Criação, Edição e Delete exigem Login)
router.post('/personagens', uploadPersonagem, personagemController.criar); // ✅ ADICIONADO
router.put('/personagens/:id', uploadPersonagem, personagemController.atualizar); // ✅ ADICIONADO
router.delete('/personagens/:id', personagemController.deletar); // ✅ ADICIONADO

export default router;