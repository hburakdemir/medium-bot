/**
 * Merkezi Prompt Kütüphanesi
 * 
 * Tüm AI promptları bu dosyada yönetilir.
 * 
 * NEDEN MERKEZİ PROMPT YÖNETİMİ?
 * 1. Tek yerden güncelleme - prompt değişince her yere yansır
 * 2. Test edilebilir - unit test yazılabilir
 * 3. Versiyonlama yapılabilir (promptV1, promptV2)
 * 4. A/B test için farklı versiyonlar denenebilir
 * 
 * KULLANIM:
 *   import { buildArticlePrompt } from './prompts.js';
 *   const prompt = buildArticlePrompt({ topic, tone, length });
 */

// ─── Ton Direktifleri ─────────────────────────────────────────────

const TONE_DIRECTIVES = {
  professional: `
    - Otoriter ve güvenilir bir ton kullan
    - Veri ve kanıtlara dayandır
    - Formal ama erişilebilir dil kullan
    - Sektör jargonunu doğru kullan
  `,
  casual: `
    - Samimi ve sıcak bir ton kullan
    - Kişisel deneyimler ve anekdotlar ekle
    - "Sen" dili kullan
    - Humor ve hafif dil kabul edilebilir
  `,
  technical: `
    - Teknik ve detaylı açıklamalar yap
    - Kod örnekleri, komutlar ekle (varsa)
    - Adım adım açıklamalar kullan
    - Teknik terimleri tanımla
  `,
  creative: `
    - Yaratıcı ve ilgi çekici bir ton kullan
    - Metafor ve benzetmeler kullan
    - Hikaye anlatımı formatı tercih et
    - Okuyucuyu sürekle tut
  `,
};

// ─── Uzunluk Direktifleri ─────────────────────────────────────────

const LENGTH_DIRECTIVES = {
  short: 'Özlü bir yazı oluştur, yaklaşık 400-600 kelime.',
  medium: 'Orta uzunlukta kapsamlı bir yazı oluştur, yaklaşık 900-1300 kelime.',
  long: 'Kapsamlı ve detaylı bir yazı oluştur, yaklaşık 1800-2500 kelime.',
};

// ─── Çıktı Format Direktifi ───────────────────────────────────────

const OUTPUT_FORMAT_DIRECTIVE = `
ÇIKTI FORMATI (KESİNLİKLE UYGULA):
- Markdown formatını kullan
- H2 başlıkları (##) ile bölümleri ayır
- Her bölüm en az 2 paragraf içersin
- Önemli kavramları **kalın** ile vurgula
- Gerekirse madde listeleri (- veya 1.) kullan
- Yazının sonuna "## Sonuç" bölümü ekle
- Hiçbir meta yorum ekleme ("Bu makale hakkında..." gibi)
- Sadece içeriği yaz
`;

// ─── Prompt Builder Fonksiyonları ─────────────────────────────────

/**
 * Medium makalesi için ana prompt oluşturur
 * @param {Object} params - Prompt parametreleri
 * @param {string} params.topic - Yazı konusu
 * @param {string} params.title - İstenen başlık (opsiyonel)
 * @param {string[]} params.tags - İlgili etiketler
 * @param {string} params.tone - Yazı tonu
 * @param {string} params.length - Yazı uzunluğu
 * @returns {string} Hazır prompt
 */
export const buildArticlePrompt = ({ topic, title, tags = [], tone = 'professional', length = 'medium' }) => {
  const toneDirective = TONE_DIRECTIVES[tone] || TONE_DIRECTIVES.professional;
  const lengthDirective = LENGTH_DIRECTIVES[length] || LENGTH_DIRECTIVES.medium;
  const tagsText = tags.length > 0 ? `İlgili konular: ${tags.join(', ')}` : '';
  const titleText = title ? `Makale başlığı: "${title}"` : '';

  return `
Sen deneyimli bir Medium yazarısın. Aşağıdaki konuda yüksek kaliteli bir Medium makalesi yaz.

KONU: ${topic}
${titleText}
${tagsText}

TON DİREKTİFLERİ:
${toneDirective}

UZUNLUK: ${lengthDirective}

${OUTPUT_FORMAT_DIRECTIVE}

Şimdi makaleyi yaz:
  `.trim();
};

/**
 * Başlık önerileri için prompt oluşturur
 * @param {Object} params
 * @param {string} params.topic - Konu
 * @param {number} params.count - Kaç başlık üretilsin
 * @returns {string} Hazır prompt
 */
export const buildTitlePrompt = ({ topic, count = 5 }) => {
  return `
Aşağıdaki konu için ${count} adet ilgi çekici Medium makale başlığı öner.

KONU: ${topic}

BAŞLIK KALİTE KRİTERLERİ:
- Merak uyandıran ve tıklanabilir
- 50-80 karakter arasında
- Net ve anlaşılır
- Clickbait olmayan, değer vaat eden
- Türkçe veya İngilizce (konuya göre)

ÇIKTI FORMATI (KESİNLİKLE):
Sadece başlıkları JSON dizisi olarak döndür. Başka hiçbir şey yazma.
Örnek: ["Başlık 1", "Başlık 2", "Başlık 3"]
  `.trim();
};

/**
 * Özet/excerpt üretme promptu
 * @param {string} content - Makale içeriği
 * @returns {string} Hazır prompt
 */
export const buildExcerptPrompt = (content) => {
  // İlk 2000 karakter yeterli - tüm içerik göndermeye gerek yok
  const excerpt = content.substring(0, 2000);

  return `
Aşağıdaki makalenin 150-200 kelimelik ilgi çekici bir özetini yaz.
Özet, okuyucuyu makalenin tamamını okumaya teşvik etmeli.

MAKALE BAŞLANGICI:
${excerpt}

KURALLAR:
- Sadece özeti yaz, başka hiçbir şey ekleme
- Spoiler verme
- Merak uyandır
  `.trim();
};