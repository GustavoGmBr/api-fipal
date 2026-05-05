import { Router } from 'express';
import capituloController from '../../controllers/capitulo.controller.js';

const router = Router();

// Listar capítulos de um livro (O controller já traz os subcapítulos aninhados em 'children')
router.get('/livro/:livroId', capituloController.listarPorLivro);

// Ver detalhes do capítulo ou subcapítulo (Inclui o campo conteudo_json)
router.get('/:id', capituloController.show);

export default router;