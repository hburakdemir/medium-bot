/**
 * Merkezi Validation Şemaları
 * 
 * Tüm input doğrulamaları Zod ile yapılır.
 * Her şema bir feature için ayrı export edilir.
 * 
 * Neden Zod?
 * - TypeScript-first API
 * - Runtime type safety
 * - Hata mesajları özelleştirilebilir
 * - .parse() hata fırlatır, .safeParse() hata döndürür
 */

import { z } from 'zod';

// ─── Auth Şemaları ───────────────────────────────────────────────

/**
 * Kayıt validation şeması
 */
export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı').max(100),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100).optional(),
});

/**
 * Giriş validation şeması
 */
export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre girin'),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Profil güncelleme şeması
 * Partial: Tüm alanlar opsiyonel, en az biri gerekli
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  apiKey: z.string().min(10, 'Geçerli bir API anahtarı girin').optional().or(z.literal('')),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'En az bir alan güncellenmeli' }
);

// ─── Post Şemaları ───────────────────────────────────────────────

/**
 * Post oluşturma/güncelleme şeması
 */
export const postSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli').max(200, 'Başlık 200 karakterden uzun olamaz'),
  content: z.string().min(1, 'İçerik gerekli'),
  excerpt: z.string().max(300, 'Özet 300 karakterden uzun olamaz').optional(),
  tags: z.array(z.string().max(50)).max(10, 'En fazla 10 etiket eklenebilir').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
});

/**
 * Sayfalama şeması - API query parametreleri için
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Gemini Şemaları ─────────────────────────────────────────────

/**
 * Gemini içerik üretme şeması
 */
export const geminiGenerateSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt en az 10 karakter olmalı')
    .max(5000, 'Prompt 5000 karakterden uzun olamaz'),
  title: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  tone: z.enum(['professional', 'casual', 'technical', 'creative']).optional().default('professional'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
});

/**
 * Gemini başlık üretme şeması
 */
export const geminiTitleSchema = z.object({
  prompt: z.string().min(5, 'Konu en az 5 karakter olmalı').max(500),
  count: z.coerce.number().int().min(1).max(10).optional().default(5),
});