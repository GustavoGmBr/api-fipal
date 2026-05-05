import { Router } from 'express';
import sistemaController from '../../controllers/sistema.controller.js';

const router = Router();

router.get('/', sistemaController.index);
router.get('/:id', sistemaController.show);

export default router;