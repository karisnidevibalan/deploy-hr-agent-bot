

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AiService } from '../src/services/aiService';

const aiService = new AiService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detect intent first
    const intent = aiService.detectIntent(message);

    // Route holiday_list intent directly to holiday lookup
    if (intent === 'holiday_list') {
      const aiReply = await aiService.processMessage(message, context);
      return res.status(200).json({
        reply: aiReply,
        timestamp: new Date().toISOString()
      });
    }

    // For other intents, fallback to normal processing (Groq API)
    const aiReply = await aiService.processMessage(message, context);
    return res.status(200).json({
      reply: aiReply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
