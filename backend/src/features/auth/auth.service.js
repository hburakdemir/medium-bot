/**
 * Auth Servis Katmanı
 * 
 * Tüm kimlik doğrulama iş mantığı burada yönetilir.
 * Controller sadece request/response ile ilgilenir.
 * 
 * TOKEN STRATEJİSİ:
 * - Access Token: Kısa ömürlü (15dk), her API isteğinde kullanılır
 * - Refresh Token: Uzun ömürlü (7-30gün), yeni access token almak için kullanılır
 * - Her refresh sonrası refresh token da yenilenir (Rotation) → çalınmış token'ı geçersiz kılar
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import AppError from '../../helpers/AppError.js';
import { sanitizeUser } from '../../helpers/idMapping.js';

// Token süreleri
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REMEMBER_ME_EXPIRY = '30d';

// ─── Token Yardımcı Fonksiyonları ─────────────────────────────────

/**
 * Access ve refresh token çifti üretir
 * @param {string} userId - Gerçek kullanıcı ID'si
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

// ─── Auth İşlemleri ───────────────────────────────────────────────

/**
 * Yeni kullanıcı kaydı oluşturur
 * Şifreyi hash'ler ve ID mapping oluşturur
 * @param {{ email, password, name }} data
 * @returns {Promise<Object>} Oluşturulan kullanıcı (public id ile)
 */
export const registerUser = async ({ email, password, name }) => {
  // E-posta zaten kayıtlı mı?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('AUTH002');
  }

  // Şifreyi hash'le (12 tur = güvenli + performanslı denge)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Transaction ile kullanıcı + mapping aynı anda oluştur
  // Transaction sayesinde biri başarısız olursa ikisi de geri alınır
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, theme: true, createdAt: true },
    });

    // ID mapping oluştur
    await tx.userMapping.create({
      data: { userId: newUser.id },
    });

    return newUser;
  });

  // Public ID ile döndür
  return sanitizeUser(user);
};

/**
 * Kullanıcı girişi yapar ve token'ları üretir
 * @param {{ email, password, rememberMe, userAgent, ip }} data
 * @returns {Promise<{ user, accessToken, refreshToken }>}
 */
export const loginUser = async ({ email, password, rememberMe, userAgent, ip }) => {
  // Kullanıcıyı bul (şifre dahil - sadece burada gerekli)
  const user = await prisma.user.findUnique({ where: { email } });

  // Güvenlik: Hem kullanıcı bulunamadı hem şifre yanlış için AYNI hata
  // Neden? Farklı mesaj vermek saldırgana hangi email'in kayıtlı olduğunu söyler
  if (!user) {
    throw new AppError('AUTH001');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('AUTH001');
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  // Session token süresini ayarla
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

  // Session kaydı oluştur
  await prisma.session.create({
    data: { userId: user.id, refreshToken, userAgent, ip, expiresAt },
  });

  // Şifreyi response'dan çıkar
  const { password: _, ...userWithoutPassword } = user;

  // Public ID ile döndür
  const publicUser = await sanitizeUser(userWithoutPassword);

  return { user: publicUser, accessToken, refreshToken };
};

/**
 * Refresh token ile yeni access token üretir (Token Rotation)
 * Her refresh'te refresh token da yenilenir
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Token'ı doğrula
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Veritabanında session var mı ve süresi dolmamış mı?
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { select: { id: true, email: true, name: true, theme: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError('AUTH007');
    }

    // Yeni token çifti üret (Token Rotation)
    const newTokens = generateTokens(session.user.id);

    // Eski refresh token'ı yeni ile değiştir
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    const publicUser = await sanitizeUser(session.user);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      user: publicUser,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('AUTH006');
  }
};

/**
 * Kullanıcı oturumunu sonlandırır
 * Refresh token'ı veritabanından siler
 * @param {string} refreshToken
 */
export const logoutUser = async (refreshToken) => {
  // deleteMany: token bulunamazsa hata fırlatmaz
  await prisma.session.deleteMany({ where: { refreshToken } });
};

/**
 * Mevcut kullanıcı bilgilerini getirir
 * @param {string} userId - Gerçek kullanıcı ID
 * @returns {Promise<Object>} Kullanıcı bilgileri (public id ile)
 */
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      theme: true,
      apiKey: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('AUTH003');
  }

  return sanitizeUser(user);
};

/**
 * Kullanıcı profilini günceller
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {Object} data - Güncellenecek alanlar
 * @returns {Promise<Object>} Güncellenmiş kullanıcı
 */
export const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, theme: true, avatar: true, apiKey: true },
  });

  return sanitizeUser(user);
};