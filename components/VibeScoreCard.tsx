import React from 'react';

interface Suggestion {
  tone: string;
  message: string;
  rationale: string;
  expectedOutcome: string;
}

interface VibeScoreCardProps {
  score: number;
  label: string;
  labelCategory: 'Sketchy' | 'Mixed' | 'Solid';
  relationshipType: string;
  emojiSummary: string;
  pullQuote: string;
  feedback: string;
  flags?: string[];
  confidence: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  suggestions?: Suggestion[];
}

export default function VibeScoreCard({
  score,
  label,
  labelCategory,
  relationshipType,
  emojiSummary,
  pullQuote,
  feedback,
  flags = [],
  confidence,
  confidenceLevel,
  suggestions = [],
}: VibeScoreCardProps) {
  const badgeColor = {
    Sketchy: 'bg-red-200 text-red-800',
    Mixed: 'bg-yellow-200 text-yellow-800',
    Solid: 'bg-green-200 text-green-800',
  }[labelCategory] || 'bg-gray-200 text-gray-800';

  const confidenceColor = {
    High: 'text-green-600',
    Medium: 'text-yellow-600',
    Low: 'text-red-600',
  }[confidenceLevel];

  return (
    <div className="bg-white dark:bg-dark-card text-gray-900 dark:text-white p-6 rounded-xl shadow-md max-w-xl mx-auto mt-6 border">
      <div className="text-5xl font-bold text-center text-black dark:text-white">{score}/100</div>
      <div className={`text-sm font-medium px-3 py-1 mt-2 rounded-full w-fit mx-auto ${badgeColor}`}>{label}</div>

      <div className="text-center text-sm mt-1 italic text-gray-500">{relationshipType}</div>

      <div className="text-3xl text-center mt-4">{emojiSummary}</div>

      <blockquote className="italic text-center mt-4 text-gray-600 dark:text-gray-300 border-l-4 border-gray-300 pl-4">
        “{pullQuote}”
      </blockquote>

      <p className="mt-4 text-sm text-center leading-relaxed text-gray-800 dark:text-gray-200">{feedback}</p>

      {flags.length > 0 && (
        <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Flags:</span> {flags.join(', ')}
        </div>
      )}

      <div className={`mt-2 text-xs text-center font-semibold ${confidenceColor}`}>
        Confidence: {confidence}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-center mb-2">Suggested Replies</h3>
          <div className="space-y-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="border rounded-lg p-4 text-sm bg-gray-50 dark:bg-neutral-900">
                <p className="font-medium">Tone: {s.tone}</p>
                <p className="text-gray-700 dark:text-gray-200">{s.message}</p>
                <p className="mt-2 text-xs text-gray-500 italic">Why this works: {s.rationale}</p>
                <p className="mt-1 text-xs text-gray-500 italic">Expected outcome: {s.expectedOutcome}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
