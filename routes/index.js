import { Router } from 'express';
import usuarioRouter from './usuario.routes.js';
import uploadRouter from './upload.js';
import uploadVeiculoRouter from './uploadVeiculo.js';
const router = Router();

router.use('/usuarios', usuarioRouter);
router.use('/upload', uploadRouter); // Certifique-se de que o prefixo do seu upload seja este ou o correto do seu projeto
router.use('/uploadVeiculo', uploadVeiculoRouter);
export default router;