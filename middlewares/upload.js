import multer from 'multer';

// Usamos memoryStorage porque o ftpService precisa do buffer do arquivo
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e WebP são permitidos.'), false);
  }
};

const uploadFields = [
  { name: 'corpo', maxCount: 1 },
  { name: 'rosto', maxCount: 1 }
];

export const uploadPersonagem = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).fields(uploadFields);