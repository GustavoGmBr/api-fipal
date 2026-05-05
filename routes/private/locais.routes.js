import { Router } from 'express';
import LocalController from '../../controllers/local.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { uploadLocal } from '../../middlewares/upload.js'; // ✅ Adicionado chaves { } e corrigido o caminho/extensão
const router = Router();

// 🔒 Rotas Privadas (Requerem Login)
router.post('/', authMiddleware, uploadLocal, LocalController.store);
router.delete('/:id', authMiddleware, LocalController.destroy);
router.put('/:id', authMiddleware, uploadLocal, LocalController.update);

export default router;