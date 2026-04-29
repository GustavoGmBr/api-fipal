import express from 'express';
const router = express.Router();

import * as authController from '../controllers/auth.controller.js';
import * as racaController from '../controllers/raca.controller.js';
import * as sistemaController from '../controllers/sistema.controller.js'; // Importando o novo controller
import authMiddleware from '../middlewares/auth.middleware.js';

// --- ROTAS PÚBLICAS ---
router.post('/login', authController.login);

// Listagem pública (útil para calculadoras e visualização)
router.get('/racas', racaController.listarTodos);
router.get('/racas/:id', racaController.buscarPorId);
router.get('/sistemas', sistemaController.listarTodos);
router.get('/sistemas/:id', sistemaController.buscarPorId);

// --- ROTAS PROTEGIDAS (GERENCIAMENTO ADMIN) ---
// Todas as rotas abaixo deste middleware exigem token JWT
router.use(authMiddleware);

// CRUD de Raças
router.post('/racas', racaController.criar);
router.put('/racas/:id', racaController.atualizar);
router.delete('/racas/:id', racaController.deletar);

// CRUD de Sistemas (Templates de Progressão)
router.post('/sistemas', sistemaController.criar);
router.put('/sistemas/:id', sistemaController.atualizar);
router.delete('/sistemas/:id', sistemaController.deletar);

export default router;