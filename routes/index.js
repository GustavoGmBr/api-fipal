import { Router } from 'express';
import usuarioRouter from './usuario.routes.js';

const router = Router();

// ✅ CORREÇÃO: Mapeia o arquivo de rotas tanto na raiz quanto no prefixo
// Isso garante que o Express vai achar os métodos (GET /, POST /login) de qualquer jeito
router.use('/usuarios', usuarioRouter);
router.use('/', usuarioRouter); 

export default router;