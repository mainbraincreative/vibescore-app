import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getVibeAnalysis(conversation: string) {
  const prompt = `
You are a highly skilled, emotionally intelligent expert communication analyst with a confident, familiar, friendly, and comically snarky voice (think your childhoodBFF meets Daniel Goleman meets Bo Burnham meets Charlamagne tha God wrapped in Leo Reich, Amelia Dimoldenberg, Matt Rife, Carrie Bradshaw and Taylor Tomlinson). A user has pasted a real conversation (from a dating app, friend, co-worker, or family member). Return a JSON object with the following:

- score (number from 0–100): How healthy the overall vibe is
- label (string): Something like "Turbulence Ahead", "Mixed Signals", or "Vibes are Immaculate"
- labelCategory (string): One of "Sketchy", "Mixed", or "Solid"
- relationshipType (string): Guess whether this is romantic, platonic, work, family, etc.
- emojiSummary (string): 2–5 emojis that reflect the emotional tone
- pullQuote (string): A line that sums up the red/green flag tone
- feedback (string): Swagger-filled, insightful analysis (max 2 sentences)
- confidence (string): Something like "Through the roof", "Moderate clarity", or "Shooting blanks"
- confidenceLevel (string): One of "High", "Medium", or "Low"
- flags (array of strings): Include emotional patterns like "love bombing", "insecurity", "gaslighting"
- replies (array): Exactly three replies — one for each tone: "empathetic", "direct", and "playful". Each should follow this structure:
  - tone: (must be one of the three categories)
  - message: the suggested reply (in the same voice/tone/style of the original conversation)
  - rationale: why this message works in this context
  - expectedOutcome: what the sender might expect from sending this

The replies must match the tone, voice, and delivery style of the original conversation (e.g. texting shorthand, slang, emojis, grammar).

Use informal, familiar, witty, warm language — don't sound like a therapist. Keep it sharp and entertaining but emotionally aware.

Here's the conversation:
"""
${conversation}
"""

Respond only with a JSON object. Do not include commentary or markdown. Do not explain yourself.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are VibeScore, a tone-savvy AI trained to analyze relationship dynamics with swagger, empathy, and sharp observational skills.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
  });

  try {
    const raw = response.choices[0].message.content || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const json = JSON.parse(cleaned);
    return json;
  } catch (err) {
    console.error('Failed to parse GPT response:', err);
    return { 
      error: 'Invalid response from model.',
      score: 65,
      label: 'Mixed',
      pullQuote: conversation.substring(0, 100) + '...',
      feedback: 'The conversation shows some positive engagement with room for clarity.',
      replies: [
        {
          tone: "empathetic",
          message: "Thanks for sharing that with me",
          rationale: "Shows appreciation while keeping it light",
          expectedOutcome: "Maintains positive engagement"
        },
        {
          tone: "direct", 
          message: "That's good to know",
          rationale: "Clear and straightforward response",
          expectedOutcome: "Keeps conversation moving forward"
        },
        {
          tone: "playful",
          message: "Haha interesting! 😄", 
          rationale: "Keeps the mood light and engaging",
          expectedOutcome: "Builds rapport and connection"
        }
      ]
    };
  }
}