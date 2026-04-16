export const FALLBACK_ERRORS = {
  NETWORK: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
  SERVER: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  AUTH: 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.',
  VALIDATION: 'Lütfen tüm alanları doğru şekilde doldurun.',
  UNKNOWN: 'Beklenmeyen bir hata oluştu.',
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.code) {
    return error.response.data.message || FALLBACK_ERRORS.UNKNOWN;
  }
  
  if (!error.response) {
    return FALLBACK_ERRORS.NETWORK;
  }
  
  switch (error.response.status) {
    case 401:
      return FALLBACK_ERRORS.AUTH;
    case 400:
      return error.response.data?.message || FALLBACK_ERRORS.VALIDATION;
    case 500:
    case 502:
    case 503:
      return FALLBACK_ERRORS.SERVER;
    default:
      return FALLBACK_ERRORS.UNKNOWN;
  }
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};
