import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '..', '..', 'public');

/**
 * Deleta a foto de perfil de um usuário.
 * Caminho: /public/images/usuarios/[nome].[ext]
 */
export function deleteFotoUsuario(urlRelativa) {
  if (!urlRelativa) return false;

  const caminhoAbsoluto = path.join(publicPath, urlRelativa);

  try {
    if (fs.existsSync(caminhoAbsoluto)) {
      fs.unlinkSync(caminhoAbsoluto);
      console.log(`🗑️ Foto deletada: ${caminhoAbsoluto}`);
      return true;
    }
    console.warn(`⚠️ Foto não encontrada para deletar: ${caminhoAbsoluto}`);
    return false;
  } catch (error) {
    console.error(`❌ Erro ao deletar foto: ${error.message}`);
    return false;
  }
}

/**
 * Deleta a pasta inteira de um veículo e tudo que está dentro dela.
 * Caminho: /public/images/veiculos/[identificador]/
 * Remove: fotos/, pericia.pdf e a própria pasta
 */
export function deletePastaVeiculo(identificador) {
  if (!identificador) return false;

  const caminhoPasta = path.join(publicPath, 'images', 'veiculos', identificador);

  try {
    if (fs.existsSync(caminhoPasta)) {
      fs.rmSync(caminhoPasta, { recursive: true, force: true });
      console.log(`🗑️ Pasta do veículo deletada: ${caminhoPasta}`);
      return true;
    }
    console.warn(`⚠️ Pasta do veículo não encontrada: ${caminhoPasta}`);
    return false;
  } catch (error) {
    console.error(`❌ Erro ao deletar pasta do veículo: ${error.message}`);
    return false;
  }
}