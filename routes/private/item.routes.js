import { Router } from 'express';
import itemController from '../../controllers/item.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.js'; // Middleware do Multer

const router = Router();

router.use(authMiddleware);

// Criar item com imagem
router.post('/', upload.single('imagem'), itemController.store);

// Atualizar item com imagem opcional
router.put('/:id', upload.single('imagem'), itemController.update);

router.delete('/:id', itemController.destroy);

export default router;