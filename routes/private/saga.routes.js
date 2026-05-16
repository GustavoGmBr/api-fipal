import { Router } from 'express';
import sagaController from '../../controllers/saga.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', sagaController.store);
router.put('/:id', sagaController.update);
router.delete('/:id', sagaController.destroy);

export default router;