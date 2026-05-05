// server/middlewares/upload.middleware.js
import multer from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Apenas imagens são permitidas!'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadPersonagem = upload.single('personagem');
export const uploadItem = upload.single('item');
export const uploadLocal = upload.single('local'); // ✅ Novo middleware para Locais

export default upload;