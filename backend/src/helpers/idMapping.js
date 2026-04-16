/**
 * ID Mapping Yardımcı Fonksiyonları
 * 
 * Bu modül, veri güvenliğinin temel katmanıdır.
 * 
 * NEDEN ID MAPPING?
 * 1. Sequential ID'ler (1, 2, 3...) saldırganlara veri boyutu hakkında bilgi verir
 * 2. Brute-force ile diğer kullanıcıların verilerine erişim denenebilir
 * 3. IDOR (Insecure Direct Object Reference) açıklarını engeller
 * 
 * NASIL ÇALIŞIR?
 * - Kayıt oluşturulurken otomatik public_id üretilir (CUID - Collision-resistant)
 * - Frontend sadece public_id görür
 * - Backend her istekte public_id → real_id dönüşümü yapar
 * 
 * ÖRNEK:
 * Frontend'de URL: /posts/ckr9v8i0o0000qnk3b0k9b8k2
 * Backend'de sorgu: WHERE real_id = (SELECT post_id FROM post_mappings WHERE public_id = 'ckr...')
 */

import prisma from '../config/database.js';
import AppError from './AppError.js';

/**
 * Post public ID'sini gerçek ID'ye çevirir
 * @param {string} publicId - Frontend'den gelen public ID
 * @param {string} userId - Güvenlik: sadece bu kullanıcının postu
 * @returns {Promise<string>} Gerçek post ID
 */
export const resolvePostId = async (publicId, userId) => {
  const mapping = await prisma.postMapping.findUnique({
    where: { publicId },
    include: { post: { select: { userId: true } } },
  });

  // Mapping bulunamadı VEYA bu post başka kullanıcıya ait
  if (!mapping || mapping.post.userId !== userId) {
    throw new AppError('POST001');
  }

  return mapping.postId;
};

/**
 * User public ID'sini gerçek ID'ye çevirir
 * @param {string} publicId - Frontend'den gelen public ID
 * @returns {Promise<string>} Gerçek user ID
 */
export const resolveUserId = async (publicId) => {
  const mapping = await prisma.userMapping.findUnique({
    where: { publicId },
  });

  if (!mapping) {
    throw new AppError('AUTH003');
  }

  return mapping.userId;
};

/**
 * Post gerçek ID'sini public ID'ye çevirir (response için)
 * @param {string} postId - Gerçek post ID
 * @returns {Promise<string>} Public ID
 */
export const getPostPublicId = async (postId) => {
  const mapping = await prisma.postMapping.findUnique({
    where: { postId },
    select: { publicId: true },
  });

  return mapping?.publicId || postId; // Fallback: mapping yoksa gerçek ID
};

/**
 * Post nesnesindeki id'yi public id ile değiştirir
 * @param {Object} post - Post objesi
 * @returns {Promise<Object>} Public id'li post objesi
 */
export const sanitizePost = async (post) => {
  if (!post) return null;

  // Mapping'i al
  const mapping = await prisma.postMapping.findUnique({
    where: { postId: post.id },
    select: { publicId: true },
  });

  return {
    ...post,
    id: mapping?.publicId || post.id, // Gerçek ID'yi public ID ile değiştir
  };
};

/**
 * Birden fazla post'u sanitize eder
 * @param {Array} posts - Post listesi
 * @returns {Promise<Array>} Public id'li post listesi
 */
export const sanitizePosts = async (posts) => {
  return Promise.all(posts.map(sanitizePost));
};

/**
 * User nesnesindeki id'yi public id ile değiştirir
 * @param {Object} user - User objesi
 * @returns {Promise<Object>} Public id'li user objesi
 */
export const sanitizeUser = async (user) => {
  if (!user) return null;

  const mapping = await prisma.userMapping.findUnique({
    where: { userId: user.id },
    select: { publicId: true },
  });

  return {
    ...user,
    id: mapping?.publicId || user.id,
  };
};