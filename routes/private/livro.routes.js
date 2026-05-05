import { Router } from 'express';
import livroController from '../../controllers/livro.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', livroController.store);
router.put('/:id', livroController.update);
router.delete('/:id', livroController.destroy);

export default router;