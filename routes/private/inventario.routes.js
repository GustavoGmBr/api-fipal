import { Router } from 'express';
import inventarioController from '../../controllers/inventario.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);


router.post('/', inventarioController.store);
router.put('/:id', inventarioController.update);
router.delete('/:id', inventarioController.destroy);
<<<<<<< HEAD
router.patch('/:id/dinheiro', inventarioController.updateDinheiro); // Corrigido
=======
router.patch('/inventario/:id/dinheiro', inventarioController.updateDinheiro);

>>>>>>> ca0e9fd5ddc13ee00a8f065b118678c503356742
export default router;