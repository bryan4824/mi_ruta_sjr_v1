import multer from 'multer';
import path from 'path';
import fs from 'fs';

export function subirArchivos() {
  const uploadDir = '/tmp/uploads';
  
  // Crear carpeta si no existe
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  });

  return multer({ storage }).single('photoPerfil');
}