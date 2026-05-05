import { Router } from 'express';
import itemController from '../../controllers/item.controller.js';

const router = Router();

router.get('/', itemController.index);
router.get('/:id', itemController.show);

export default router;