import { Router } from 'express';
import usuarioRouter from './usuario.routes.js';
import uploadRouter from './upload.js';
import uploadVeiculoRouter from './uploadVeiculo.js';

const router = Router();

// Vincula o arquivo de usuários no caminho esperado pelo Express
router.use('/usuarios', usuarioRouter);
router.use('/', usuarioRouter); 

// Deixa os arquivos de upload organizados
router.use('/upload', uploadRouter);
router.use('/uploadVeiculo', uploadVeiculoRouter);

export default router;