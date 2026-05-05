import { Router } from 'express';
import capituloController from '../../controllers/capitulo.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

// CRUD de Capítulos/Subcapítulos
router.post('/', capituloController.store);
router.put('/:id', capituloController.update);
router.delete('/:id', capituloController.destroy);

// 🚀 Rota para o Editor Dinâmico (Salva o array de blocos no JSON)
// Endpoint: PUT /api/private/capitulos/:id/conteudo
router.put('/:id/conteudo', capituloController.updateConteudo);

export default router;