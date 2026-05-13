import { Router } from 'express';
import inventarioController from '../../controllers/inventario.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);


router.post('/', inventarioController.store);
router.put('/:id', inventarioController.update);
router.delete('/:id', inventarioController.destroy);
router.patch('/inventario/:id/dinheiro', inventarioController.updateDinheiro);

export default router;