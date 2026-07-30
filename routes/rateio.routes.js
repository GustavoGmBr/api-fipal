// hooks/useRateios.js (mesmo código, sem alterações)

// rateio.routes.js - CORREÇÃO
import { Router } from 'express';
import * as controller from '../controller/rateio.controller.js';

const router = Router();

console.log('✅ Registrando rotas de rateios...');

// ============================================
// 1. ROTAS DE RELATÓRIOS E ANÁLISES (ESPECÍFICAS)
// ============================================
router.get('/resumo-setores', controller.getResumoSetores);
router.get('/periodo', controller.getRateiosByPeriod);
router.get('/setor-mes', controller.getSectorByMonth);
router.get('/comparacao-setores', controller.getSectorComparison); // ✅ ANTES da rota com parâmetro
router.get('/estatisticas', controller.getRateioStats);

// ============================================
// 2. ROTAS PRINCIPAIS
// ============================================
router.get('/', controller.getAllRateios);

// ============================================
// 3. ROTAS COM PARÂMETROS (DEPOIS das específicas)
// ============================================
router.get('/despesa/:id_despesa', controller.getRateiosByDespesa);

console.log('✅ Todas as rotas de rateios registradas!');

export default router;