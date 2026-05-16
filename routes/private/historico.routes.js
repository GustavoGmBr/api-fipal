import { Router } from 'express';
import historicoController from '../../controllers/historico.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/:id', historicoController.show);

router.post('/', historicoController.store);
router.put('/:id', historicoController.update);
router.delete('/:id', historicoController.destroy);

export default router;