import express from 'express';
import * as sistemaController from '../controllers/sistemaController.js';

const router = express.Router();

router.post('/', sistemaController.criar);
router.get('/', sistemaController.listarTodos);
router.get('/:id', sistemaController.buscarPorId);
router.put('/:id', sistemaController.atualizar);
router.delete('/:id', sistemaController.deletar);

export default router;