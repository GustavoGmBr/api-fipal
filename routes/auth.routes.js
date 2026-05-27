import { Router } from 'express';
import { login, me, cadastro, editar, deletar } from '../controllers/authController.js';
import { loginRequired } from '../middlewares/authMiddleware.js';

const router = Router();

// --- Rotas Públicas ---
router.post('/login', login);

// --- Rotas Privadas (Requerem Token JWT válido) ---
router.get('/me', loginRequired, me);

// CRUD de Usuários
router.post('/usuarios', loginRequired, cadastro);       // Cadastrar novo usuário
router.put('/usuarios/:id', loginRequired, editar);      // Editar usuário pelo ID passado na URL
router.delete('/usuarios/:id', loginRequired, deletar);   // Deletar usuário pelo ID passado na URL

export default router;