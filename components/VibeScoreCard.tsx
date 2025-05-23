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
    Sketchy: 'bg-light-red dark:bg-dark-red text-white',
    Mixed: 'bg-light-yellow dark:bg-dark-yellow text-black',
    Solid: 'bg-light-green dark:bg-dark-green text-black',
  }[label] || 'bg-gray-200 text-gray-800';

  return (
    <div className="bg-light-card dark:bg-dark-card text-light-foreground dark:text-dark-foreground p-6 rounded-2xl shadow-md max-w-xl mx-auto mt-8 border border-light-border dark:border-dark-border">
      <div className="text-center">
        <div className="text-5xl font-extrabold mb-2">{score}/100</div>
        <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${labelColor}`}>{label}</div>
      </div>

      <div className="text-4xl text-center mt-6 mb-4">{emojiSummary}</div>

      <blockquote className="italic text-base text-center text-gray-600 dark:text-gray-300 px-6 py-3 border-l-4 border-light-blue dark:border-dark-blue">
        “{pullQuote}”
      </blockquote>

      <div className="text-sm text-center mt-4 max-w-md mx-auto text-gray-700 dark:text-gray-300">
        {feedback}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-light-border dark:border-dark-border mt-6 pt-3">
        <span>Flags: {flags.length > 0 ? flags.join(', ') : 'None'}</span>
        <span>Confidence: {confidence}</span>
      </div>
    </div>
  );
}
