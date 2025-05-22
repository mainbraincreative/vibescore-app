// pages/api/analyze.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getVibeAnalysis } from '../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `text` in request body' });
  }

  // Fallback: return mock data if OPENAI_API_KEY is missing
  if (!process.env.OPENAI_API_KEY) {
    console.warn('No OpenAI API Key found — returning mock data');
    return res.status(200).json({
      score: 68,
      label: 'Mixed',
      flags: ['inconsistency', 'vagueness'],
      confidence: 'Medium',
      emojiSummary: '🤔📉🧐',
      pullQuote: '“Idk if I’ll be around but maybe hit me up”',
      feedback: 'The energy here is a little unclear—maybe test the waters, but don’t cannonball in.',
    });
  }

  try {
    const result = await getVibeAnalysis(text);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('VibeScore API Error:', error);
    return res.status(500).json({ error: 'Something went wrong while scoring the vibe.' });
  }
}
