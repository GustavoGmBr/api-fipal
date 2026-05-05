import { Router } from 'express';
import sistemaController from '../../controllers/sistema.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', sistemaController.store);
router.put('/:id', sistemaController.update);
router.delete('/:id', sistemaController.destroy);

export default router;