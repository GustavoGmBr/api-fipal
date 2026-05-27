import { Router } from 'express';
// Adicionada a função 'listarTodos' no import abaixo:
import { login, me, cadastro, editar, deletar, listarTodos } from '../controllers/authController.js';
import { loginRequired } from '../middlewares/authMiddleware.js';

const router = Router();

// --- Rotas Públicas ---
router.post('/login', login);

// --- Rotas Privadas (Requerem Token JWT válido) ---
router.get('/me', loginRequired, me);

// CRUD de Usuários
router.get('/usuarios', loginRequired, listarTodos);     // <-- NOVA ROTA: Listar todos
router.post('/usuarios', loginRequired, cadastro);       // Cadastrar novo usuário
router.put('/usuarios/:id', loginRequired, editar);      // Editar usuário pelo ID
router.delete('/usuarios/:id', loginRequired, deletar);   // Deletar usuário pelo ID

export default router;