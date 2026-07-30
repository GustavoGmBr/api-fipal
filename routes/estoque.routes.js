import { Router } from 'express';
import {
  create,
  readAll,
  readById,
  update,
  sincronizarEstoque,
  getReport,
  getLocacoes,
  remove
} from '../controller/estoque.controller.js'; // Ajuste o caminho conforme sua estrutura

const router = Router();

// --- ROTAS DE RELATÓRIO / DASHBOARD ---
// Nota: Deixamos acima das rotas com ':id' para o Express não confundir a palavra 'report' com um ID numérico.
router.get('/report', getReport);
router.get('/locacoes', getLocacoes);

// --- CRUD PADRÃO ---
router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);
router.delete('/:id', remove);

// --- REGRAS DE NEGÓCIO E AÇÕES ---
router.patch('/:id/sincronizar', sincronizarEstoque);

export default router;