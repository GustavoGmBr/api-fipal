import { Router } from 'express';
import sagaController from '../../controllers/saga.controller.js';

const router = Router();

router.get('/', sagaController.index);
router.get('/:id', sagaController.show);

export default router;