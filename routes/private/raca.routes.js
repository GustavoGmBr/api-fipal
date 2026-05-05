import { Router } from 'express';
import racaController from '../../controllers/raca.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', racaController.store);
router.put('/:id', racaController.update);
router.delete('/:id', racaController.destroy);

export default router;