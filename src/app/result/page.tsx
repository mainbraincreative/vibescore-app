import VibeScoreCard from '@/components/VibeScoreCard';

export default function ResultPage() {
  const vibe = {
    score: 35,
    label: 'Turbulence Ahead',
    pullQuote: "Dude you're blowing it so hard.",
    summary: 'There’s a lot of frustration and misalignment here.',
    flags: [
      { type: 'frustration', emoji: '🔻', reason: 'impatience' },
    ],
    replies: {
      empathetic: {
        text: "I'm just overwhelmed. I’m not trying to be difficult.",
        why: 'It de-escalates and invites clarity.',
        outcome: 'They feel seen, not attacked.',
      },
      direct: {
        text: 'You’re losing me fast. Do you want to reset or bail?',
        why: 'It forces a line in the sand.',
        outcome: 'You get clarity fast.',
      },
      playful: {
        text: 'Alright bro, go touch some grass.',
        why: 'It diffuses tension with humor.',
        outcome: 'You stay in power without aggression.',
      },
    },
  };

  return (
    <main className="min-h-screen p-6 bg-background text-foreground flex items-center justify-center">
      <VibeScoreCard vibe={vibe} />
    </main>
  );
}