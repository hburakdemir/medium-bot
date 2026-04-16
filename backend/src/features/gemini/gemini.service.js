/**
 * Gemini AI Servis Katmanı
 * 
 * Google Gemini API entegrasyonu.
 * 
 * NEDEN KULLANICI BAŞINA API KEY?
 * - Her kullanıcı kendi Gemini API key'ini kullanır
 * - Sunucu tarafında merkezi API key maliyeti önlenir
 * - Kullanım limitleri kullanıcıya aittir
 * 
 * PROMPT STRATEJİSİ:
 * - Tüm promptlar lib/prompts.js'den gelir
 * - Service sadece prompt'u çağırır, içeriğini yazmaz
 * - Bu sayede prompt'lar merkezi yönetilir ve test edilir
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../config/database.js';
import AppError from '../../helpers/AppError.js';
import { buildArticlePrompt, buildTitlePrompt } from '../../lib/prompts.js';
import { sanitizePost } from '../../helpers/idMapping.js';

// Kullanılacak Gemini modeli
const GEMINI_MODEL = 'gemini-pro';

/**
 * Kullanıcının API key'i ile Gemini client oluşturur
 * @param {string} apiKey
 * @returns {Object} Gemini model instance
 */
const createGeminiModel = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
};

/**
 * Kullanıcının API key'ini doğrular ve getirir
 * @param {string} userId
 * @returns {Promise<string>} API key
 */
const getUserApiKey = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiKey: true },
  });

  if (!user?.apiKey) {
    throw new AppError('GEMINI002');
  }

  return user.apiKey;
};

/**
 * Makale içeriği üretir ve post olarak kaydeder
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {{ prompt, title, tags, tone, length }} params
 * @returns {Promise<Object>} Oluşturulan post (public id ile)
 */
export const generateContent = async (userId, { prompt, title, tags, tone, length }) => {
  const apiKey = await getUserApiKey(userId);
  const model = createGeminiModel(apiKey);

  // Merkezi prompt builder'dan prompt oluştur
  const fullPrompt = buildArticlePrompt({
    topic: prompt,
    title,
    tags,
    tone,
    length,
  });

  try {
    const result = await model.generateContent(fullPrompt);
    const generatedText = result.response.text();

    // Post ve mapping'i transaction ile oluştur
    const post = await prisma.$transaction(async (tx) => {
      const newPost = await tx.post.create({
        data: {
          userId,
          title: title || 'AI Tarafından Üretildi',
          content: generatedText,
          // İlk 200 karakteri excerpt olarak kullan
          excerpt: generatedText.substring(0, 200).replace(/[#*]/g, '').trim() + '...',
          tags: tags || [],
          status: 'DRAFT',
        },
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

    // Gemini isteğini logla (analiz için)
    await prisma.geminiRequest.create({
      data: {
        userId,
        prompt,
        response: generatedText,
        model: GEMINI_MODEL,
        tokens: generatedText.length, // Gerçek token sayısı için Gemini API kullanılabilir
      },
    });

    return sanitizePost(post);
  } catch (error) {
    // Gemini hatasını app hatasına dönüştür
    if (error instanceof AppError) throw error;
    
    console.error('Gemini API Hatası:', error.message);
    throw new AppError('GEMINI003');
  }
};

/**
 * Başlık önerileri üretir
 * @param {string} userId - Gerçek kullanıcı ID
 * @param {{ prompt, count }} params
 * @returns {Promise<{ titles: string[] }>}
 */
export const generateTitles = async (userId, { prompt, count = 5 }) => {
  const apiKey = await getUserApiKey(userId);
  const model = createGeminiModel(apiKey);

  const titlePrompt = buildTitlePrompt({ topic: prompt, count });

  try {
    const result = await model.generateContent(titlePrompt);
    const responseText = result.response.text().trim();

    // JSON parse dene - model'e JSON döndürmesini söyledik
    let titles;
    try {
      titles = JSON.parse(responseText);
      if (!Array.isArray(titles)) {
        throw new Error('Dizi değil');
      }
    } catch {
      // JSON parse başarısız olursa satır satır parse et
      titles = responseText
        .split('\n')
        .map((t) => t.replace(/^[\d\.\-\*\s"]+|["]+$/g, '').trim())
        .filter((t) => t.length > 0)
        .slice(0, count);
    }

    return { titles };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('GEMINI003');
  }
};