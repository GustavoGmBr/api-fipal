import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.resolve(
  __dirname,      // backend/utils/
  '..',           // backend/
  '..',           // raiz
  'frontend',     // ← ADICIONAR frontend
  'public'
);

export function deleteFotoUsuario(urlRelativa) {
  if (!urlRelativa) return false;
  const caminhoAbsoluto = path.join(publicPath, urlRelativa);
  // Agora: RAIZ/frontend/public/images/usuarios/joao.jpg ✓
  // Antes: RAIZ/public/images/usuarios/joao.jpg              ✗
  try {
    if (fs.existsSync(caminhoAbsoluto)) {
      fs.unlinkSync(caminhoAbsoluto);
      console.log(`🗑️ Foto deletada: ${caminhoAbsoluto}`);
      return true;
    }
    console.warn(`⚠️ Foto não encontrada: ${caminhoAbsoluto}`);
    return false;
  } catch (error) {
    console.error(`❌ Erro ao deletar foto: ${error.message}`);
    return false;
  }
}