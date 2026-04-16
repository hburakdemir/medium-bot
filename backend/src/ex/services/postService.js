import prisma from '../config/database.js';
import AppError from '../helpers/AppError.js';

export const createPost = async (userId, data) => {
  const post = await prisma.post.create({
    data: { ...data, userId },
    select: { id: true, userId: true, title: true, status: true, createdAt: true },
  });
  return post;
};

export const getPosts = async (userId, { page, limit }) => {
  const skip = (page - 1) * limit;

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
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where: { userId } }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    },
  };
};

export const getPostById = async (userId, postId) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
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

  return post;
};

export const updatePost = async (userId, postId, data) => {
  const post = await prisma.post.findFirst({ where: { id: postId, userId } });
  if (!post) {
    throw new AppError('POST001');
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data,
    select: { id: true, userId: true, title: true, status: true, updatedAt: true },
  });

  return updated;
};

export const deletePost = async (userId, postId) => {
  const post = await prisma.post.findFirst({ where: { id: postId, userId } });
  if (!post) {
    throw new AppError('POST001');
  }

  await prisma.post.delete({ where: { id: postId } });
  return { deleted: true };
};
