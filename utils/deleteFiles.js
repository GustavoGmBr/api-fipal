import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.resolve(
  __dirname,      // backend/utils/
  '..',           // backend/
  '..',           // raiz
  'frontend',     // frontend
  'public'
);

export function deleteFotoUsuario(urlRelativa) {
  if (!urlRelativa) return false;
  const caminhoAbsoluto = path.join(publicPath, urlRelativa);
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

export function deletePericiaUsado(urlRelativa) {
  if (!urlRelativa) return false;
  const caminhoAbsoluto = path.join(publicPath, urlRelativa);
  try {
    if (fs.existsSync(caminhoAbsoluto)) {
      fs.unlinkSync(caminhoAbsoluto);
      console.log(`🗞️ Perícia deletada: ${caminhoAbsoluto}`);
      return true;
    }
    console.warn(`⚠️ Perícia não encontrada: ${caminhoAbsoluto}`);
    return false;
  } catch (error) {
    console.error(`❌ Erro ao deletar perícia: ${error.message}`);
    return false;
  }
}

export function deleteFotosUsado(arrayDeUrls) {
  if (!Array.isArray(arrayDeUrls) || arrayDeUrls.length === 0) {
    console.warn('⚠️ Array de URLs vazio ou inválido');
    return false;
  }
  let deletedCount = 0;
  arrayDeUrls.forEach(url => {
    const caminhoAbsoluto = path.join(publicPath, url);
    try {
      if (fs.existsSync(caminhoAbsoluto)) {
        fs.unlinkSync(caminhoAbsoluto);
        console.log(`🗑️ Foto deletada: ${caminhoAbsoluto}`);
        deletedCount++;
      } else {
        console.warn(`⚠️ Foto não encontrada: ${caminhoAbsoluto}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao deletar foto: ${error.message}`);
    }
  });
  console.log(`📸 ${deletedCount} foto(s) deletada(s) do veículo`);
  return true;
}