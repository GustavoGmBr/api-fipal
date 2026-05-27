import express from 'express';
import usuariosController from '../controllers/usuarios.controller.js';

const router = express.Router();

router.post('/usuarios', usuariosController.criar);
router.get('/usuarios', usuariosController.listar);
router.get('/usuarios/:id', usuariosController.obterPorId);
router.put('/usuarios/:id', usuariosController.atualizar);
router.delete('/usuarios/:id', usuariosController.deletar);

export default router;