/**
 * Posts Controller
 * Controller sadece request/response yönetir.
 * İş mantığı posts.service.js'de.
 */

import * as postsService from './posts.service.js';
import { postSchema, paginationSchema } from '../../helpers/validators.js';

/**
 * POST /api/posts
 * Yeni post oluştur
 */
export const create = async (req, res, next) => {
  try {
    const data = postSchema.parse(req.body);
    const post = await postsService.createPost(req.user.id, data);

    res.status(201).json({
      success: true,
      message: 'Yazı oluşturuldu',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts
 * Kullanıcının postlarını sayfalı getir
 */
export const getAll = async (req, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await postsService.getPosts(req.user.id, pagination);

    res.json({
      success: true,
      ...result, // posts + pagination spread edilir
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/:id
 * Tekil post getir (public id ile)
 */
export const getById = async (req, res, next) => {
  try {
    const post = await postsService.getPostById(req.user.id, req.params.id);

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/posts/:id
 * Post güncelle (kısmi güncelleme)
 */
export const update = async (req, res, next) => {
  try {
    // .partial(): tüm alanlar opsiyonel
    const data = postSchema.partial().parse(req.body);
    const post = await postsService.updatePost(req.user.id, req.params.id, data);

    res.json({
      success: true,
      message: 'Yazı güncellendi',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/posts/:id
 * Post sil
 */
export const remove = async (req, res, next) => {
  try {
    await postsService.deletePost(req.user.id, req.params.id);

    res.json({
      success: true,
      message: 'Yazı silindi',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts/upload
 * Kapak resmi yükle
 */
export const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'FILE002',
        message: 'Dosya seçilmedi',
      });
    }

    const coverUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: { url: coverUrl },
    });
  } catch (error) {
    next(error);
  }
};