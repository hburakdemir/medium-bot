import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import AppError from '../../helpers/AppError.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

export const registerUser = async ({ email, password, name }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('AUTH002');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true, theme: true, createdAt: true },
  });

  return user;
};

export const loginUser = async ({ email, password, rememberMe, userAgent, ip }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('AUTH001');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('AUTH001');
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent,
      ip,
      expiresAt,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError('AUTH007');
    }

    const newTokens = generateTokens(decoded.userId);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        theme: session.user.theme,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('AUTH006');
  }
};

export const logoutUser = async (refreshToken) => {
  await prisma.session.deleteMany({ where: { refreshToken } });
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, theme: true, apiKey: true, avatar: true, createdAt: true },
  });
  if (!user) {
    throw new AppError('AUTH003');
  }
  return user;
};

export const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, theme: true, avatar: true, apiKey: true },
  });
  return user;
};
