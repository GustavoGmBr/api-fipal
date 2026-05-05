import { Router } from 'express';
import livroController from '../../controllers/livro.controller.js';

const router = Router();

router.get('/', livroController.index);
router.get('/:id', livroController.show);

export default router;