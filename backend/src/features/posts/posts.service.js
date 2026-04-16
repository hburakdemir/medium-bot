/**
 * Post Servis Katmanı
 * 
 * Post CRUD işlemleri ve iş mantığı.
 * 
 * ID MAPPING AKIŞI:
 * 1. Frontend public_id gönderir
 * 2. resolvePostId() ile gerçek ID'ye çevrilir
 * 3. Veritabanı işlemi gerçek ID ile yapılır
 * 4. Response'da sanitizePost() ile tekrar public_id'ye çevrilir
 */

import prisma from '../../config/database.js';
import AppError from '../../helpers/AppError.js';
import { resolvePostId, sanitizePost, sanitizePosts } from '../../helpers/idMapping.js';

/**
 * Yeni post oluşturur ve ID mapping kaydı ekler
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {Object} data - Post verileri
 * @returns {Promise<Object>} Oluşturulan post (public id ile)
 */
export const createPost = async (userId, data) => {
  // Transaction: post + mapping aynı anda oluşturulur
  const post = await prisma.$transaction(async (tx) => {
    const newPost = await tx.post.create({
      data: { ...data, userId },
      select: {
        id: true,
        userId: true,
        title: true,
        excerpt: true,
        status: true,
        tags: true,
        createdAt: true,
      },
    });

    // ID mapping oluştur
    await tx.postMapping.create({
      data: { postId: newPost.id },
    });

    return newPost;
  });

  return sanitizePost(post);
};

/**
 * Kullanıcıya ait postları sayfalı getirir
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {{ page, limit }} pagination
 * @returns {Promise<{ posts, pagination }>}
 */
export const getPosts = async (userId, { page, limit }) => {
  const skip = (page - 1) * limit;

  // Paralel sorgu: postlar + toplam sayı
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        title: true,
        excerpt: true,
        status: true,
        mediumUrl: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        // Mapping'i de include et (sanitize için gerekli)
        postMapping: { select: { publicId: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where: { userId } }),
  ]);

  // Her post'ta id'yi public_id ile değiştir
  const sanitizedPosts = posts.map((post) => {
    const { postMapping, ...rest } = post;
    return {
      ...rest,
      id: postMapping?.publicId || post.id, // Public ID kullan
    };
  });

  return {
    posts: sanitizedPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    },
  };
};

/**
 * Tekil post getirir
 * @param {string} userId - Gerçek kullanıcı ID (sahiplik kontrolü)
 * @param {string} publicId - Frontend'den gelen public ID
 * @returns {Promise<Object>} Post (public id ile)
 */
export const getPostById = async (userId, publicId) => {
  // Public ID → gerçek ID (aynı zamanda sahiplik kontrolü)
  const postId = await resolvePostId(publicId, userId);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true,
      title: true,
      content: true,
      excerpt: true,
      coverImage: true,
      tags: true,
      status: true,
      mediumUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!post) {
    throw new AppError('POST001');
  }

  return sanitizePost(post);
};

/**
 * Post günceller
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {string} publicId - Frontend'den gelen public ID
 * @param {Object} data - Güncellenecek veriler
 * @returns {Promise<Object>} Güncellenmiş post
 */
export const updatePost = async (userId, publicId, data) => {
  // Sahiplik + ID çözümleme
  const postId = await resolvePostId(publicId, userId);

  const updated = await prisma.post.update({
    where: { id: postId },
    data,
    select: {
      id: true,
      userId: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  return sanitizePost(updated);
};

/**
 * Post siler
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {string} publicId - Frontend'den gelen public ID
 * @returns {Promise<{ deleted: true }>}
 */
export const deletePost = async (userId, publicId) => {
  const postId = await resolvePostId(publicId, userId);

  // Cascade: post_mappings ve diğer ilişkili kayıtlar otomatik silinir (Prisma schema'da tanımlı)
  await prisma.post.delete({ where: { id: postId } });

  return { deleted: true };
};