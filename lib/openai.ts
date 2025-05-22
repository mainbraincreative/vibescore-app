// lib/openai.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getVibeAnalysis(conversation: string) {
  const prompt = `
You are a tone and relationship dynamics analyst. A user has submitted a real-life conversation between two people. Your job is to return a JSON object with the following fields:

- score (number between 0 and 100): how healthy or respectful the overall vibe is
- label (string): one of "Sketchy", "Solid", or "Mixed"
- flags (array of strings): patterns like "love bombing", "gaslighting", "emotional avoidance", "over-apologizing", "control issues", etc.
- confidence (string): High / Medium / Low
- emojiSummary (string): a 2–5 emoji summary of the emotional tone
- pullQuote (string): the most tone-defining line from the conversation
- feedback (string): a short, witty analysis of the tone, as if you were explaining the subtext to a close friend, family member or business associate

This conversation could be romantic, professional, familial, or between friends. Don’t assume romantic intent unless it’s obvious.

Here is the conversation:

"""
${conversation}
"""

Respond ONLY with a valid JSON object. Do NOT include any preamble, notes, or explanation.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a tone and relationship dynamics analyst, trained to assess the emotional clarity, safety, and subtext of conversations across all relationship types—romantic, familial, workplace, or platonic.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  try {
    const raw = response.choices[0].message.content || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const json = JSON.parse(cleaned);
    return json;
  } catch (err) {
    console.error('Failed to parse GPT response:', err);
    return { error: 'Invalid response from model.' };
  }
}
