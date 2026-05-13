import { Router } from 'express';
import inventarioController from '../../controllers/inventario.controller.js';

const router = Router();

router.get('/', inventarioController.index);
router.get('/:id', inventarioController.show);

export default router;