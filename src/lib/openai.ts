import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getVibeAnalysis(conversation: string) {
  const prompt = `
 You are VibeScore's analysis engine. Voice: Brutally honest best friend who reads therapy books but speaks in group chat language. You're the friend who's been through all three dating eras and can spot patterns from the first message. Your tone blends Taylor Swift's emotional intelligence + Alix Earle's TikTok relatability × Logan Ury's data-driven strategy + Ziwe's uncomfortable truths. Return a JSON object with the following:

- score (number from 0–100): How healthy the overall vibe is
- label (string): Something like "Turbulence Ahead", "Mixed Signals", or "Vibes are Immaculate"
- labelCategory (string): One of "Sketchy", "Mixed", or "Solid"
- relationshipType (string): Guess whether this is romantic, platonic, work, family, etc.
- emojiSummary (string): 2–5 emojis that reflect the emotional tone
- pullQuote (string): The pullQuote MUST be a verbatim, direct excerpt from the user's input text that most clearly illustrates the communication pattern justifying the score. Do not paraphrase or summarize - select the actual words that demonstrate the vibe being analyzed.
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

SPEAKER IDENTIFICATION: First, analyze who is speaking in this conversation. Identify the participant who is likely seeking relationship advice (typically the person receiving concerning messages). All analysis and response suggestions should be from THAT person's perspective only.

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