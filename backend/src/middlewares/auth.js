/**
 * Kimlik Doğrulama Middleware'leri
 * 
 * authenticate: Token doğrular, req.user'ı set eder
 * optionalAuth: Token varsa doğrular, yoksa devam eder (public route'lar için)
 * 
 * NEDEN COOKIE-BASED TOKEN?
 * - httpOnly cookie XSS saldırılarına karşı koruma sağlar
 * - localStorage/sessionStorage JavaScript ile okunabilir → XSS riski
 * - httpOnly cookie sadece browser tarafından otomatik gönderilir
 */

import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import AppError from '../helpers/AppError.js';

/**
 * Zorunlu kimlik doğrulama
 * Token geçersizse 401 hatası fırlatır
 */
export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    // Token yoksa → yetkisiz
    if (!accessToken) {
      throw new AppError('AUTH006');
    }

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Token süresi dolmuş mu yoksa tamamen geçersiz mi?
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('AUTH005'); // Süresi dolmuş → refresh dene
      }
      throw new AppError('AUTH006'); // Geçersiz token → yeniden giriş
    }

    // Kullanıcı hâlâ var mı?
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, theme: true, apiKey: true },
    });

    if (!user) {
      throw new AppError('AUTH003');
    }

    // Request'e kullanıcıyı ekle
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Opsiyonel kimlik doğrulama
 * Token varsa doğrular ama yoksa hata fırlatmaz
 * Public sayfalar için uygundur
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, theme: true },
    });

    req.user = user || null;
    next();
  } catch {
    // Hata olursa sessizce devam et
    req.user = null;
    next();
  }
};