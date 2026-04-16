import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../config/database.js';
import AppError from '../../helpers/AppError.js';

export const generateContent = async (userId, { prompt, title, tags, tone, length }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.apiKey) {
    throw new AppError('GEMINI002');
  }

  const genAI = new GoogleGenerativeAI(user.apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const toneInstructions = {
    professional: 'Write in a professional, authoritative tone.',
    casual: 'Write in a casual, friendly tone.',
    technical: 'Write in a technical, detailed tone.',
    creative: 'Write in a creative, engaging tone.',
  };

  const lengthInstructions = {
    short: 'Keep the response concise, around 300-500 words.',
    medium: 'Write a moderate length content, around 800-1200 words.',
    long: 'Write detailed, comprehensive content, around 1500-2500 words.',
  };

  const enhancedPrompt = `
    ${prompt}
    
    ${tone ? toneInstructions[tone] : ''}
    ${length ? lengthInstructions[length] : ''}
    ${title ? `The title should be: "${title}"` : ''}
    ${tags?.length ? `Include these topics: ${tags.join(', ')}` : ''}
    
    Format the output as a Medium article with proper headings, paragraphs, and structure.
  `;

  try {
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const text = response.text();

    const generatedPost = {
      title: title || 'Untitled',
      content: text,
      excerpt: text.substring(0, 200) + '...',
      tags: tags || [],
      status: 'draft',
      userId,
    };

    const post = await prisma.post.create({
      data: generatedPost,
      select: { id: true, userId: true, title: true, excerpt: true, status: true, createdAt: true },
    });

    await prisma.geminiRequest.create({
      data: {
        userId,
        prompt,
        response: text,
        model: 'gemini-pro',
        tokens: text.length,
      },
    });

    return post;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new AppError('GEMINI003');
  }
};

export const generateTitle = async (userId, { prompt }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.apiKey) {
    throw new AppError('GEMINI002');
  }

  const genAI = new GoogleGenerativeAI(user.apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    const result = await model.generateContent(`Generate a catchy, engaging title for a Medium article based on this topic: ${prompt}. Only return the title, nothing else.`);
    const title = result.response.text().trim();

    return { title };
  } catch (error) {
    throw new AppError('GEMINI003');
  }
};
