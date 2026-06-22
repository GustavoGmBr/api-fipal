import { Router } from 'express';
import { create, readAll, readById, update, remove } from '../controller/testDrive.controller.js';

const router = Router();

router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;