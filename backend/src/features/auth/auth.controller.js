/**
 * Auth Controller
 * 
 * Bu katman SADECE şunları yapar:
 * 1. Request verisini al ve validate et
 * 2. Service'i çağır
 * 3. Response'u formatla ve gönder
 * 4. Hataları next(error) ile global handler'a ilet
 * 
 * İş mantığı BURAYA YAZILMAZ → auth.service.js'e gider
 */

import * as authService from './auth.service.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../../helpers/validators.js';
import AppError from '../../helpers/AppError.js';

// ─── Cookie Ayarları ─────────────────────────────────────────────

/**
 * Token cookie'lerini set eder
 * Production'da secure: true (HTTPS zorunlu)
 * @param {Object} res - Express response objesi
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {boolean} rememberMe - Uzun oturum mu?
 */
const setTokenCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieBase = {
    httpOnly: true,            // JavaScript erişemez → XSS koruması
    secure: isProduction,      // Sadece HTTPS üzerinden → Production'da zorunlu
    sameSite: 'lax',           // CSRF koruması
  };

  // Access token: 15 dakika
  res.cookie('accessToken', accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh token: beni hatırla seçimine göre 30gün veya 7gün
  res.cookie('refreshToken', refreshToken, {
    ...cookieBase,
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
  });
};

// ─── Controller Fonksiyonları ─────────────────────────────────────

/**
 * POST /api/auth/register
 * Yeni kullanıcı kaydı
 */
export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.registerUser(data);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Kullanıcı girişi
 */
export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await authService.loginUser({
      ...data,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection?.remoteAddress,
    });

    // Token'ları güvenli cookie'lere yaz
    setTokenCookies(res, accessToken, refreshToken, data.rememberMe);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Oturumu sonlandır
 */
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    // Cookie'leri temizle
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Çıkış başarılı',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Access token'ı refresh et
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError('AUTH006');
    }

    const tokens = await authService.refreshAccessToken(token);

    // Yeni token'ları cookie'lere yaz
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      data: { user: tokens.user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Mevcut kullanıcı bilgileri
 */
export const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/profile
 * Profil güncelleme
 */
export const updateProfile = async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user.id, data);

    res.json({
      success: true,
      message: 'Profil güncellendi',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};