import * as authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../helpers/validators.js';
import AppError from '../helpers/AppError.js';

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

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.loginUser({
      ...data,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    });

    const maxAge = data.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
    });

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

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

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError('AUTH006');
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { user: tokens.user },
    });
  } catch (error) {
    next(error);
  }
};

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

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
