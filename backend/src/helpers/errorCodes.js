export const ErrorCodes = {
  AUTH001: 'Invalid credentials',
  AUTH002: 'Email already exists',
  AUTH003: 'User not found',
  AUTH004: 'Account not verified',
  AUTH005: 'Token expired',
  AUTH006: 'Invalid token',
  AUTH007: 'Session expired',
  AUTH008: 'Too many login attempts',

  VALIDATION001: 'Validation failed',
  VALIDATION002: 'Invalid input format',
  VALIDATION003: 'Missing required fields',

  POST001: 'Post not found',
  POST002: 'Cannot delete post',
  POST003: 'Cannot update post',

  GEMINI001: 'Gemini API error',
  GEMINI002: 'API key not configured',
  GEMINI003: 'Content generation failed',

  FILE001: 'File too large',
  FILE002: 'Invalid file type',
  FILE003: 'Upload failed',

  SERVER001: 'Internal server error',
  SERVER002: 'Service unavailable',
};

export const ErrorMessages = {
  AUTH001: 'E-posta veya şifre hatalı',
  AUTH002: 'Bu e-posta adresi zaten kullanılıyor',
  AUTH003: 'Kullanıcı bulunamadı',
  AUTH004: 'Hesap doğrulanmamış',
  AUTH005: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın',
  AUTH006: 'Geçersiz token',
  AUTH007: 'Oturum süresi dolmuş',
  AUTH008: 'Çok fazla giriş denemesi, lütfen bekleyin',

  VALIDATION001: 'Doğrulama hatası',
  VALIDATION002: 'Geçersiz format',
  VALIDATION003: 'Eksik alanlar var',

  POST001: 'Yazı bulunamadı',
  POST002: 'Yazı silinemedi',
  POST003: 'Yazı güncellenemedi',

  GEMINI001: 'AI servisi hatası',
  GEMINI002: 'API anahtarı ayarlanmamış',
  GEMINI003: 'İçerik oluşturulamadı',

  FILE001: 'Dosya çok büyük (max 20MB)',
  FILE002: 'Geçersiz dosya türü',
  FILE003: 'Dosya yüklenemedi',

  SERVER001: 'Sunucu hatası',
  SERVER002: 'Servis şu an kullanılamıyor',
};
