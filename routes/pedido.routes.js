import { Router } from 'express';
import { 
  create, 
  readAll, 
  readById, 
  update, 
  remove,
  finalizarPedido,
  desativarPedido,
  ativarPedido,
  getReport,
  getAvailableYears
} from '../controller/pedido.controller.js';

const router = Router();

// --- Rotas Analíticas e Relatórios ---
// (Devem vir antes de rotas com parâmetros como /:id)

// Retorna os anos que possuem pedidos para popular filtros de busca
router.get('/anos-disponiveis', getAvailableYears);

// Retorna o relatório consolidado (resumo, vendedores, veículos)
router.get('/relatorio', getReport);


// --- Funções de Negócio / Status ---

// Rota específica para a regra de negócio de finalização e cálculo de dias
router.put('/:id/finalizar', finalizarPedido);

// Rotas para controle de ativação (Exclusão lógica / Soft Delete)
router.patch('/:id/desativar', desativarPedido);
router.patch('/:id/ativar', ativarPedido); // ou apenas ativarPedido


// --- CRUD Básico ---
router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);

// O remove agora funciona como alias para a desativação interna
router.delete('/:id', remove);

export default router;