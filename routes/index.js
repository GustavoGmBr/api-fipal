import { Router } from 'express';
import usuarioRouter from './usuario.routes.js';
import usadosRouter from './usado.routes.js';
import tradeinRouter from './tradein.routes.js';
import testDriveRouter from './testDrive.routes.js';
import despesaRouter from './despesa.routes.js';
import categoriaPedidoRouter from './categoria_pedido.routes.js';
import pedidosRouter from './pedido.routes.js';
import jogosRouter from './jogo.routes.js';

import uploadRouter from './upload.js';
import uploadVeiculoRouter from './uploadVeiculo.js';

const router = Router();

// Vincula o arquivo de usuários no caminho esperado pelo Express
router.use('/usuarios', usuarioRouter);
router.use('/usados', usadosRouter);
router.use('/tradeins', tradeinRouter);
router.use('/test-drives', testDriveRouter);
router.use('/despesas', despesaRouter);
router.use('/categoria_pedido', categoriaPedidoRouter);
router.use('/pedidos', pedidosRouter);
router.use('/jogos', jogosRouter);

// Deixa os arquivos de upload organizados
router.use('/upload', uploadRouter);
router.use('/uploadVeiculo', uploadVeiculoRouter);

export default router;