import { Router } from 'express';
import * as controller from '../controller/despesa.controller.js';

const router = Router();

console.log('✅ Registrando rotas de despesas...');

// ============================================
// 1. ROTAS ANALÍTICAS DE DESPESAS
// ============================================
router.get('/total-periodo', controller.getTotalPeriodo);
router.get('/comparativo-dia', controller.getDayBasedComparison);
router.get('/relatorio-trimestral', controller.getQuarterlyReport);
router.get('/despesas-mensais', controller.getMonthlyHistory);

// ============================================
// 2. CRUD - DESPESAS
// ============================================
router.post('/', controller.create);
router.get('/', controller.readAll);

// ============================================
// 3. ROTAS COM PARÂMETROS (ORDEM CORRETA)
// ============================================

// 🔥 Rota genérica: /despesas/:id (DEVE ser a ÚLTIMA com parâmetro)
router.get('/:id', controller.readById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

console.log('✅ Todas as rotas de despesas registradas!');

export default router;