import { Router } from 'express';
import {
  create,
  readAll,
  readById,
  update,
  remove,
  getDadosConsolidados,
  getRelatorioPorUsuario,
  resetarBanca, // <-- Adicione aqui
  getTopJogadores
} from '../controller/jogo.controller.js';

const router = Router();

// --- Adições Analíticas (Dashboard / Rankings) ---
// Nota: Devem vir antes do '/:id' para o Express não confundir a palavra-chave com um ID numérico
router.get('/dashboard/consolidado', getDadosConsolidados);
router.get('/dashboard/ranking', getTopJogadores);
// NOVA ROTA: Aceita tanto o ID do usuário quanto o login (Ex: /jogos/relatorio/1 ou /jogos/relatorio/joaosilva)
router.get('/relatorio/:identificador', getRelatorioPorUsuario);
// Rota para resetar a banca do jogador
router.post('/resetar-banca', resetarBanca);
// --- CRUD Básico ---
router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;