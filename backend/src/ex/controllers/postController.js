import * as postService from '../services/postService.js';
import { postSchema, paginationSchema } from '../helpers/validators.js';

export const create = async (req, res, next) => {
  try {
    const data = postSchema.parse(req.body);
    const post = await postService.createPost(req.user.id, data);

    res.status(201).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await postService.getPosts(req.user.id, pagination);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.user.id, req.params.id);

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = postSchema.partial().parse(req.body);
    const post = await postService.updatePost(req.user.id, req.params.id, data);

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await postService.deletePost(req.user.id, req.params.id);

    res.json({
      success: true,
      message: 'Yazı silindi',
    });
  } catch (error) {
    next(error);
  }
};

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
