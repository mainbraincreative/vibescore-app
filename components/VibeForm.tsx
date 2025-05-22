'use client';

import { useState } from 'react';
import VibeScoreCard from './VibeScoreCard';

export default function VibeForm() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">VibeScore</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your conversation here…"
          className="w-full h-40 p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm resize-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Get VibeScore'}
        </button>
      </form>

      {result && (
        <div className="mt-8 w-full max-w-xl">
          <VibeScoreCard
            score={result.score}
            label={result.label}
            confidence={result.confidence}
            flags={result.flags}
            emojiSummary={result.emojiSummary}
            pullQuote={result.pullQuote}
            feedback={result.feedback}
          />
        </div>
      )}
    </div>
  );
}