import { Router } from 'express';
import { 
  create, 
  readAll, 
  readById, 
  update, 
  remove 
} from '../controller/categoria_pedido.controller.js';

const router = Router();

// --- CRUD Básico ---
router.post('/', create);
router.get('/', readAll);
router.get('/:id', readById);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;