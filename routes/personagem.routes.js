import { Router } from 'express';
import { personagemController } from '../controllers/personagem.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas protegidas pelo JWT
router.use(authMiddleware);

// Upload configurado para receber as duas imagens
const uploadImagens = upload.fields([
  { name: 'imagem_rosto', maxCount: 1 },
  { name: 'imagem_full', maxCount: 1 }
]);

// Rotas básicas do personagem
router.get('/', personagemController.listarTodos);
router.get('/:id', personagemController.buscarPorId);
router.post('/', uploadImagens, personagemController.criar);
router.put('/:id', uploadImagens, personagemController.atualizar);
router.delete('/:id', personagemController.deletar);

// Novas rotas de Progressão de Ranque
router.post('/:id/ranque', personagemController.adicionarProgressaoRanque);
router.delete('/:id/ranque/:progressaoId', personagemController.deletarProgressaoRanque);

export default router;