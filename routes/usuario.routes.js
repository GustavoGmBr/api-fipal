import { Router } from 'express';
import { create, readAll, readById, update, remove, login } from '../controller/usuario.controller.js';

const router = Router();

router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/login', login);

export default router;