/**
 * Hata Kodları ve Mesajları
 * 
 * Tüm hata mesajları bu dosyadan yönetilir.
 * Yeni bir hata eklerken hem ErrorCodes hem ErrorMessages'a eklemelisiniz.
 * 
 * Kod formatı: [KATEGORI][3_BASAMAK_SAYI]
 * Kategoriler: AUTH, POST, GEMINI, FILE, VALIDATION, SERVER
 */

export const ErrorCodes = {
  // ─── Auth Hataları ─────────────────────────────────────────────
  AUTH001: 'INVALID_CREDENTIALS',
  AUTH002: 'EMAIL_ALREADY_EXISTS',
  AUTH003: 'USER_NOT_FOUND',
  AUTH004: 'ACCOUNT_NOT_VERIFIED',
  AUTH005: 'TOKEN_EXPIRED',
  AUTH006: 'INVALID_TOKEN',
  AUTH007: 'SESSION_EXPIRED',
  AUTH008: 'TOO_MANY_ATTEMPTS',

  // ─── Post Hataları ─────────────────────────────────────────────
  POST001: 'POST_NOT_FOUND',
  POST002: 'POST_DELETE_FAILED',
  POST003: 'POST_UPDATE_FAILED',
  POST004: 'POST_CREATE_FAILED',

  // ─── Gemini AI Hataları ─────────────────────────────────────────
  GEMINI001: 'GEMINI_API_ERROR',
  GEMINI002: 'API_KEY_NOT_CONFIGURED',
  GEMINI003: 'CONTENT_GENERATION_FAILED',
  GEMINI004: 'PROMPT_TOO_LONG',

  // ─── Dosya Hataları ─────────────────────────────────────────────
  FILE001: 'FILE_TOO_LARGE',
  FILE002: 'INVALID_FILE_TYPE',
  FILE003: 'UPLOAD_FAILED',

  // ─── Doğrulama Hataları ─────────────────────────────────────────
  VALIDATION001: 'VALIDATION_FAILED',
  VALIDATION002: 'INVALID_FORMAT',
  VALIDATION003: 'MISSING_REQUIRED_FIELDS',

  // ─── Sunucu Hataları ─────────────────────────────────────────────
  SERVER001: 'INTERNAL_SERVER_ERROR',
  SERVER002: 'SERVICE_UNAVAILABLE',
  SERVER003: 'RATE_LIMIT_EXCEEDED',
};

export const ErrorMessages = {
  // ─── Auth Mesajları ─────────────────────────────────────────────
  AUTH001: 'E-posta veya şifre hatalı',
  AUTH002: 'Bu e-posta adresi zaten kullanılıyor',
  AUTH003: 'Kullanıcı bulunamadı',
  AUTH004: 'Hesap doğrulanmamış',
  AUTH005: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın',
  AUTH006: 'Geçersiz oturum, lütfen tekrar giriş yapın',
  AUTH007: 'Oturum süresi dolmuş',
  AUTH008: 'Çok fazla giriş denemesi, lütfen bekleyin',

  // ─── Post Mesajları ─────────────────────────────────────────────
  POST001: 'Yazı bulunamadı',
  POST002: 'Yazı silinemedi',
  POST003: 'Yazı güncellenemedi',
  POST004: 'Yazı oluşturulamadı',

  // ─── Gemini AI Mesajları ─────────────────────────────────────────
  GEMINI001: 'AI servisi hatası',
  GEMINI002: 'Gemini API anahtarı ayarlanmamış. Profil ayarlarınızdan API anahtarınızı ekleyin.',
  GEMINI003: 'İçerik oluşturulamadı, lütfen tekrar deneyin',
  GEMINI004: 'Prompt çok uzun (maksimum 5000 karakter)',

  // ─── Dosya Mesajları ─────────────────────────────────────────────
  FILE001: 'Dosya çok büyük (maksimum 20MB)',
  FILE002: 'Geçersiz dosya türü (sadece JPEG, PNG, GIF, WebP)',
  FILE003: 'Dosya yüklenemedi',

  // ─── Doğrulama Mesajları ─────────────────────────────────────────
  VALIDATION001: 'Doğrulama hatası',
  VALIDATION002: 'Geçersiz format',
  VALIDATION003: 'Zorunlu alanlar eksik',

  // ─── Sunucu Mesajları ─────────────────────────────────────────────
  SERVER001: 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
  SERVER002: 'Servis şu an kullanılamıyor',
  SERVER003: 'Çok fazla istek gönderdiniz, lütfen bekleyin',
};

/**
 * HTTP Durum Kodları
 * Her hata kategorisi için varsayılan HTTP status kodu
 */
export const getStatusCode = (errorCode) => {
  // Kod prefix'ine göre HTTP status belirle
  const prefix = errorCode?.replace(/\d+$/, '');
  
  const statusMap = {
    AUTH: 401,
    POST: 404,
    GEMINI: 502,
    FILE: 400,
    VALIDATION: 400,
    SERVER: 500,
  };

  return statusMap[prefix] || 500;
};