import { Router } from 'express';
import usuarioRouter from './usuario.routes.js';

const router = Router();

router.use('/usuarios', usuarioRouter);

export default router;