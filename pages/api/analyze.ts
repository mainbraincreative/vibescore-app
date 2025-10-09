import type { NextApiRequest, NextApiResponse } from 'next';
import { getVibeAnalysis } from '../../src/lib/openai';
import limiter from '../../src/lib/rate-limit';
import { getClientIP, sanitizeInput } from '../../src/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  try {
    await limiter.check(5, getClientIP(req));
  } catch {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `text` in request body' });
  }

  const sanitizedText = sanitizeInput(text);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('No OpenAI API Key found — returning mock data');
    return res.status(200).json({
      score: 68,
      label: 'Mixed',
      flags: ['inconsistency', 'vagueness'],
      confidence: 'Medium',
      emojiSummary: '🤔📉🧐',
      pullQuote: "“Idk if I'll be around but maybe hit me up”", // Fixed: use double quotes
      feedback: "The energy here is a little unclear—maybe test the waters, but don't cannonball in.", // Fixed: use double quotes
    });
  }

  try {
    const result = await getVibeAnalysis(sanitizedText);
    return res.status(200).json(result);
  } catch (error: unknown) {  // Changed from 'any' to 'unknown'
    console.error('VibeScore API Error:', error);
    return res.status(500).json({ error: 'Something went wrong while checking the vibe.' });
  }
}