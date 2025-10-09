'use client';

import { useRef, useState } from 'react';

export default function VibeScoreCard({ vibe }: { vibe: any }) {
  const cardRef = useRef(null);
  const [activeTone, setActiveTone] = useState('empathetic');
  const [copied, setCopied] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const handleShare = async () => {
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'linear-gradient(135deg, #d4f1e8 0%, #a8e6cf 100%)';
    if (score >= 60) return 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #ffd7e0 0%, #ffb3c1 100%)';
    return 'linear-gradient(135deg, #ffcccb 0%, #ffb3ba 100%)';
  };

  const getScoreMood = (score: number) => {
    if (score >= 80) return { emoji: '✨', text: 'Really positive energy' };
    if (score >= 60) return { emoji: '💫', text: 'Generally good vibes' };
    if (score >= 40) return { emoji: '🌙', text: 'Proceed thoughtfully' };
    return { emoji: '🕊️', text: 'Worth noting' };
  };

  const mood = getScoreMood(vibe.score);

  return (
    <div className="max-w-md w-full space-y-6">
      {/* Vibe Card */}
      <div
        ref={cardRef}
        className="relative rounded-3xl p-8 shadow-lg"
        style={{
          background: 'linear-gradient(165deg, #fff9f5 0%, #fdf5f0 50%, #faf0ea 100%)',
          border: '1px solid #e8ddd5'
        }}
      >
        <div className="absolute -top-3 -right-3">
          <div 
            className="rounded-2xl px-5 py-3 font-medium shadow-md"
            style={{
              background: getScoreGradient(vibe.score),
              border: '1px solid rgba(255,255,255,0.8)'
            }}
          >
            <div className="text-3xl font-light" style={{ color: '#5a4a42' }}>{vibe.score}</div>
            <div className="text-xs uppercase tracking-wider mt-1" style={{ color: '#8a7a72' }}>Score</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center pt-4">
            <div className="text-4xl mb-3">{mood.emoji}</div>
            <h1 className="text-xl font-light tracking-wide" style={{ color: '#6a5a52' }}>{mood.text}</h1>
          </div>

          <div 
            className="text-center leading-relaxed rounded-2xl p-6"
            style={{ 
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid #f0e6dc'
            }}
          >
            <p className="font-light italic text-base" style={{ color: '#7a6a62' }}>"{vibe.pullQuote}"</p>
          </div>

          <div className="text-sm text-center leading-relaxed font-light px-2" style={{ color: '#8a7a72' }}>
            {vibe.feedback}
          </div>

          {vibe.flags && vibe.flags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {vibe.flags.slice(0, 3).map((flag: any, idx: number) => (
                <div 
                  key={idx} 
                  className="px-4 py-2 rounded-full text-xs font-light"
                  style={{
                    background: '#f5ebe5',
                    color: '#7a6a62',
                    border: '1px solid #e8ddd5'
                  }}
                >
                  {flag.emoji} {flag.type}
                </div>
              ))}
            </div>
          )}

          <div 
            className="text-center text-xs pt-6 font-light tracking-wide"
            style={{ 
              color: '#b0a098',
              borderTop: '1px solid #e8ddd5'
            }}
          >
            VibeScore — Clarity before you reply
          </div>
        </div>
      </div>

      {/* Response Suggestions */}
      <div 
        className="rounded-3xl p-6 shadow-lg"
        style={{
          background: '#ffffff',
          border: '1px solid #e8ddd5'
        }}
      >
        <h3 className="font-light text-lg mb-6 text-center tracking-wide" style={{ color: '#6a5a52' }}>How you might respond</h3>
        
        <div className="flex gap-3 mb-6 justify-center">
          {['empathetic', 'direct', 'playful'].map((tone) => (
            <button
              key={tone}
              onClick={() => setActiveTone(tone)}
              className="px-5 py-2.5 rounded-full text-sm font-light capitalize transition-all tracking-wide"
              style={
                activeTone === tone
                  ? { background: '#c9b5a8', color: '#ffffff' }
                  : { background: '#faf5f0', color: '#9a8a82', border: '1px solid #e8ddd5' }
              }
            >
              {tone}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div 
            className="rounded-2xl p-6"
            style={{
              background: '#faf5f0',
              border: '1px solid #e8ddd5'
            }}
          >
            <p className="text-base font-light leading-relaxed" style={{ color: '#6a5a52' }}>
              💬 {vibe.replies?.[activeTone]?.text}
            </p>
          </div>
          <p className="text-sm text-center font-light leading-relaxed px-2" style={{ color: '#9a8a82' }}>
            {vibe.replies?.[activeTone]?.why}
          </p>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(vibe.replies?.[activeTone]?.text || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full mt-6 py-4 px-6 rounded-2xl shadow-md transition-all duration-200 tracking-wide font-light"
          style={{
            background: '#c9b5a8',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          {copied ? 'Copied ✓' : 'Copy response'}
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="w-full py-4 rounded-2xl shadow-md transition-all duration-200 tracking-wide font-light hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #c9b5a8 0%, #b8a397 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.3)'
        }}
      >
        📸 Share This Vibe
      </button>

      {/* Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
          <div 
            className="rounded-3xl p-8 text-center shadow-2xl border-4 animate-bounce"
            style={{
              background: 'linear-gradient(135deg, #fff9f5 0%, #fdf5f0 100%)',
              borderColor: '#e8ddd5'
            }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-light mb-2 tracking-wide" style={{ color: '#6a5a52' }}>Vibe Shared!</h3>
            <p className="mb-4 font-light" style={{ color: '#8a7a72' }}>Thanks for spreading the good vibes!</p>
            <button 
              onClick={() => setShowReward(false)}
              className="px-6 py-2 rounded-full font-light transition"
              style={{
                background: '#c9b5a8',
                color: '#ffffff'
              }}
            >
              Keep Going
            </button>
          </div>
        </div>
      )}
    </div>
  );
}