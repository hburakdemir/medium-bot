/**
 * Prisma Client Singleton
 * 
 * Neden singleton?
 * Her require/import yeni bir bağlantı açar → bağlantı havuzu tükenir
 * Singleton pattern ile tek bir client instance kullanılır
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Development'da sorguları logla, production'da sadece hataları
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

export default prisma;