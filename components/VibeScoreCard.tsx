'use client';

type VibeScoreProps = {
  score: number;
  label: string;
  flags?: string[];
  confidence: string;
  emojiSummary: string;
  pullQuote: string;
  feedback: string;
};

export default function VibeScoreCard({
  score,
  label,
  flags = [],
  confidence,
  emojiSummary,
  pullQuote,
  feedback,
}: VibeScoreProps) {
  const labelColor = {
    Sketchy: 'bg-red-200 text-red-800',
    Mixed: 'bg-yellow-200 text-yellow-800',
    Solid: 'bg-green-200 text-green-800',
  }[label] || 'bg-gray-200 text-gray-800';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-lg mx-auto mt-6 border">
      <div className="text-4xl font-bold text-center mb-2">{score}/100</div>
      <div className={`text-sm font-medium px-2 py-1 rounded-full w-fit mx-auto ${labelColor}`}>
        {label}
      </div>

      <div className="text-3xl text-center mt-4">{emojiSummary}</div>

      <blockquote className="italic text-center mt-4 text-gray-600">“{pullQuote}”</blockquote>

      <div className="text-sm text-gray-700 mt-4 text-center">{feedback}</div>

      {flags.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Flags: {flags.join(', ')}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        Confidence: {confidence}
      </div>
    </div>
  );
}