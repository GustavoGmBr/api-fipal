import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sanitizar(str) {
  if (!str) return 'sem_placa';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toUpperCase();
}

function criarStorage(tipo) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const placa = sanitizar(req.body?.placa || 'temp');
        const pasta = path.resolve(
          __dirname, '..', '..', 'frontend', 'public', 'images', 'veiculos', placa
        );
        fs.mkdirSync(pasta, { recursive: true });
        cb(null, pasta);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const placa = sanitizar(req.body?.placa || 'temp');
        if (tipo === 'pericia') {
          cb(null, `${placa}_pericia.pdf`);
        } else {
          const ext = path.extname(file.originalname).toLowerCase();
          // Usa crypto.randomUUID para evitar nomes duplicados
          const unique = crypto.randomUUID().slice(0, 8);
          cb(null, `${placa}_${unique}${ext}`);
        }
      } catch (err) {
        cb(err);
      }
    },
  });
}

function criarFileFilter(extPermitidos) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (extPermitidos.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Formato inválido. Permitidos: ${extPermitidos.join(', ')}`), false);
    }
  };
}

export const uploadFotosVeiculo = multer({
  storage: criarStorage('fotos'),
  fileFilter: criarFileFilter(['.jpeg', '.jpg', '.png']),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 20, // Máximo de 20 arquivos por requisição
  },
});

export const uploadPericiaVeiculo = multer({
  storage: criarStorage('pericia'),
  fileFilter: criarFileFilter(['.pdf']),
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 1,
  },
});