import { Router } from 'express';
import capituloController from '../../controllers/capitulo.controller.js';

const router = Router();

// 1. Rotas estáticas ou específicas primeiro
router.get('/recentes', capituloController.listarRecentes);

// 2. Rotas com parâmetros dinâmicos depois
router.get('/livro/:livroId', capituloController.listarPorLivro);
router.get('/:id', capituloController.show);

export default router;