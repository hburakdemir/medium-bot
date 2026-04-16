/**
 * Özel Hata Sınıfı
 * 
 * Tüm operasyonel hatalar bu sınıf üzerinden fırlatılır.
 * isOperational: true → Global error handler tarafından yakalanır ve kullanıcıya gösterilir
 * isOperational: false → Beklenmedik hatalar, loglanır ama kullanıcıya detay verilmez
 * 
 * Kullanım:
 *   throw new AppError('AUTH001');
 *   throw new AppError('POST001', 'Özel mesaj');  // message override
 */

import { ErrorMessages, getStatusCode } from './error.messages.js';

class AppError extends Error {
  constructor(code, customMessage = null) {
    // Önce custom message, yoksa merkezi mesaj, yoksa generic fallback
    const message = customMessage || ErrorMessages[code] || 'Bir hata oluştu';
    
    super(message);
    
    this.code = code;
    this.message = message;
    this.statusCode = getStatusCode(code);
    this.isOperational = true; // Global handler bu flag'e bakarak güvenli hata mı diye ayırt eder

    // Stack trace'i temiz tut
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;