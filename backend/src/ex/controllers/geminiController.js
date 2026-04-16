import * as geminiService from '../services/geminiService.js';
import { geminiPromptSchema } from '../helpers/validators.js';

export const generate = async (req, res, next) => {
  try {
    const data = geminiPromptSchema.parse(req.body);
    const post = await geminiService.generateContent(req.user.id, data);

    res.status(201).json({
      success: true,
      message: 'İçerik oluşturuldu',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const generateTitle = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const result = await geminiService.generateTitle(req.user.id, { prompt });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
