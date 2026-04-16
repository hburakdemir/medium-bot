/**
 * Dosya Yükleme Middleware
 * 
 * Multer ile dosya yükleme konfigürasyonu.
 * Sadece resim dosyaları kabul edilir.
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from '../helpers/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Uploads klasörü src dışında, proje kökünde
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// ─── Disk Storage Konfigürasyonu ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya adı: timestamp + random + orijinal uzantı
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user?.id || 'anon'}-${uniqueSuffix}${ext}`);
  },
});

// ─── Dosya Türü Filtresi ─────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('FILE002'), false);
  }
};

// ─── Multer Instance ─────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1,                    // Aynı anda en fazla 1 dosya
  },
});

export default upload;