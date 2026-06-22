import { Router } from 'express';
import { 
  create, 
  readAll, 
  readById, 
  update, 
  remove,
  getTotalPeriodo,
  getDayBasedComparison,
  getQuarterlyReport,
  getMonthlyHistory,
  getSectorComparison,
  getSimpleMonthlyComparison
} from '../controller/despesa.controller.js';

const router = Router();

// --- Rotas Analíticas e Dashboards ---
// (Devem vir antes das rotas com parâmetros dinâmicos :id para evitar conflitos)

// Retorna o total consolidado de um mês (exigido pelo Hook para o card de mês anterior)
router.get('/total-periodo', getTotalPeriodo);

// Retorna o comparativo MTD - Month To Date (dia atual vs mesmo dia do mês anterior)
router.get('/comparativo-dia', getDayBasedComparison);

router.get('/relatorio-trimestral', getQuarterlyReport);
router.get('/despesas-mensais', getMonthlyHistory);
router.get('/despesas-por-setor', getSectorComparison);
router.get('/comparacao/mensal', getSimpleMonthlyComparison);

// --- CRUD Básico ---
router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;