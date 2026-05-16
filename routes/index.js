import { Router } from 'express';
import personagempublic from './public/personagem.routes.js';
import personagemprivate from './private/personagem.routes.js';
import authRoutes from './public/auth.routes.js';
import racapublic from './public/raca.routes.js';
import racaprivate from './private/raca.routes.js';
import sistemapublic from './public/sistema.routes.js';
import sistemaprivate from './private/sistema.routes.js'; // ⚠️ Notei 'sistemas' aqui, verifique se o arquivo é 'sistema' ou 'sistemas'
import historicopublic from './public/historico.routes.js';
import historicoprivate from './private/historico.routes.js';
import livropublic from './public/livro.routes.js';
import livroprivate from './private/livro.routes.js';
import capitulopublic from './public/capitulo.routes.js';
import capituloprivate from './private/capitulo.routes.js';
import itempublic from './public/item.routes.js';
import itemprivate from './private/item.routes.js';
import localpublic from './public/locais.routes.js';
import localprivate from './private/locais.routes.js';
import sagaspublic from './public/saga.routes.js';
import sagasprivate from './private/saga.routes.js';
import inventariopublic from './public/inventario.routes.js';
import inventarioprivate from './private/inventario.routes.js';
const router = Router();

// 🔑 Autenticação - CORRIGIDO para /api/auth/login
// Removi o '/public' do caminho da URL, mas mantive o import da pasta public
router.use('/auth', authRoutes); 

// 📍 sagas
router.use('/sagas', sagaspublic);
router.use('/private/sagas', sagasprivate);

// 👥 Personagens
router.use('/personagens', personagempublic); // Acessível via /api/personagens
router.use('/private/personagens', personagemprivate);

// 🧌 Racas
router.use('/racas', racapublic);
router.use('/private/racas', racaprivate);

// 🖥️ Sistema
router.use('/sistemas', sistemapublic);
router.use('/private/sistemas', sistemaprivate);

// 📜 Histórico
router.use('/historicos', historicopublic);
router.use('/private/historicos', historicoprivate);

// 📖 Livro
router.use('/livros', livropublic);
router.use('/private/livros', livroprivate);

// 📄 Capitulo
router.use('/capitulos', capitulopublic);
router.use('/private/capitulos', capituloprivate);

// ⚔️ Itens
router.use('/itens', itempublic);
router.use('/private/itens', itemprivate);

// 📍 Locais
router.use('/locais', localpublic);
router.use('/private/locais', localprivate);

// ⚔️ Inventario
router.use('/inventarios', inventariopublic);
router.use('/private/inventarios', inventarioprivate);

export default router;