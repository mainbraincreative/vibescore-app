// src/app/page.tsx - Complete with Instagram share
'use client';

import { useState } from 'react';
import Tesseract from 'tesseract.js';

// Define proper types
interface VibeResult {
  score: number;
  label: string;
  pullQuote: string;
  feedback: string;
  flags: Array<{ type: string; emoji?: string }> | string[];
  replies: {
    empathetic: { text: string; why: string };
    direct: { text: string; why: string };
    playful: { text: string; why: string };
  };
}

interface Reply {
  tone: string;
  message: string;
  rationale: string;
  expectedOutcome: string;
}

export default function HomePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VibeResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTone, setActiveTone] = useState('empathetic');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Instagram screenshot function
  const captureAndShareInstagram = async () => {
    const html2canvas = (await import('html2canvas')).default;
    
    const element = document.getElementById('vibescore-result');
    if (element) {
      const canvas = await html2canvas(element, {
        width: 1080,
        height: 1080,
        scale: 2,
        backgroundColor: '#F8C8C8'
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'vibescore.png', { type: 'image/png' });
          
          // For mobile - share via native share sheet
          if (navigator.share) {
            navigator.share({
              files: [file],
              title: 'My VibeScore',
              text: `My VibeScore: ${result?.score} - ${mood?.text}`
            });
          } else {
            // Fallback - download the image
            const link = document.createElement('a');
            link.download = 'vibescore-instagram.png';
            link.href = URL.createObjectURL(blob);
            link.click();
            alert('Screenshot saved! Ready for Instagram 📱');
          }
        }
      });
    }
  };

  const analyzeText = async (input: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      
      console.log('Raw API Response:', data);
      
      // Handle the array format with {tone, message, rationale, expectedOutcome} objects
      let transformedResult;
      
      if (Array.isArray(data.replies)) {
        // Convert array of reply objects to the expected format
        const replyArray = data.replies as Reply[];
        const replies = {
          empathetic: replyArray.find((r) => r.tone === 'empathetic') || { message: '', rationale: '' },
          direct: replyArray.find((r) => r.tone === 'direct') || { message: '', rationale: '' },
          playful: replyArray.find((r) => r.tone === 'playful') || { message: '', rationale: '' }
        };
        
        transformedResult = {
          score: data.score || 65,
          label: data.label || 'Mixed',
          pullQuote: data.pullQuote || input.substring(0, 100) + '...',
          feedback: data.feedback || 'The conversation shows some positive engagement with room for clarity.',
          flags: data.flags || [],
          replies: {
            empathetic: { 
              text: (replies.empathetic as Reply).message || "Thanks for sharing that with me", 
              why: (replies.empathetic as Reply).rationale || "Shows appreciation while keeping it light" 
            },
            direct: { 
              text: (replies.direct as Reply).message || "That's good to know", 
              why: (replies.direct as Reply).rationale || "Clear and straightforward response" 
            },
            playful: { 
              text: (replies.playful as Reply).message || "Haha interesting! 😄", 
              why: (replies.playful as Reply).rationale || "Keeps the mood light and engaging" 
            }
          }
        };
      } else if (data.replies && typeof data.replies === 'object') {
        // If replies is already an object with tone keys
        const replies = data.replies as any;
        transformedResult = {
          score: data.score || 65,
          label: data.label || 'Mixed',
          pullQuote: data.pullQuote || input.substring(0, 100) + '...',
          feedback: data.feedback || 'The conversation shows some positive engagement with room for clarity.',
          flags: data.flags || [],
          replies: {
            empathetic: { 
              text: replies.empathetic?.message || replies.empathetic?.text || "Thanks for sharing that with me", 
              why: replies.empathetic?.rationale || replies.empathetic?.why || "Shows appreciation while keeping it light" 
            },
            direct: { 
              text: replies.direct?.message || replies.direct?.text || "That's good to know", 
              why: replies.direct?.rationale || replies.direct?.why || "Clear and straightforward response" 
            },
            playful: { 
              text: replies.playful?.message || replies.playful?.text || "Haha interesting! 😄", 
              why: replies.playful?.rationale || replies.playful?.why || "Keeps the mood light and engaging" 
            }
          }
        };
      } else {
        // Fallback to mock data
        transformedResult = {
          score: data.score || 65,
          label: data.label || 'Mixed',
          pullQuote: input.substring(0, 100) + '...',
          feedback: 'The conversation shows some positive engagement with room for clarity.',
          flags: [],
          replies: {
            empathetic: { text: "Thanks for sharing that with me", why: "Shows appreciation while keeping it light" },
            direct: { text: "That's good to know", why: "Clear and straightforward response" },
            playful: { text: "Haha interesting! 😄", why: "Keeps the mood light and engaging" }
          }
        };
      }
      
      console.log('Transformed Result:', transformedResult);
      setResult(transformedResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to mock data if API fails
      setResult({
        score: 65,
        label: 'Mixed',
        pullQuote: input.substring(0, 100) + '...',
        feedback: 'The conversation shows some positive engagement with room for clarity.',
        flags: [],
        replies: {
          empathetic: { text: "Thanks for sharing that with me", why: "Shows appreciation while keeping it light" },
          direct: { text: "That's good to know", why: "Clear and straightforward response" },
          playful: { text: "Haha interesting! 😄", why: "Keeps the mood light and engaging" }
        }
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we have a file but no text yet (OCR still processing or failed)
    if (uploadedFile && !text.trim()) {
      alert('Please wait for the image to process, or try uploading again.');
      return;
    }
    
    // If we have text from OCR or manual input
    if (text.trim()) {
      analyzeText(text);
    } else if (uploadedFile) {
      // If we have a file but no text, try OCR again
      setLoading(true);
      try {
        const { data: { text: extracted } } = await Tesseract.recognize(uploadedFile, 'eng');
        setText(extracted);
        analyzeText(extracted);
      } catch (error) {
        console.error('OCR failed on submit:', error);
        setLoading(false);
        alert('Failed to process the image. Please try another screenshot.');
      }
    } else {
      alert('Please enter text or upload a screenshot.');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    console.log('File selected:', file.name);
    setUploadedFile(file);
    setLoading(true);
    
    // Reset the file input immediately
    const fileInput = document.getElementById('screenshot-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    try {
      console.log('Starting OCR...');
      const { data: { text: extracted } } = await Tesseract.recognize(file, 'eng');
      console.log('OCR completed, text:', extracted.substring(0, 50) + '...');
      
      setText(extracted);
      setLoading(false);
      
      // Auto-submit the form after successful OCR
      setTimeout(() => {
        console.log('Auto-submitting form...');
        analyzeText(extracted);
      }, 100);
      
    } catch (error) {
      console.error('OCR failed:', error);
      setLoading(false);
      setUploadedFile(null);
      alert('Failed to read text from image. Please try another screenshot.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'linear-gradient(135deg, #F8C8C8 0%, #E2D1F9 100%)';
    if (score >= 60) return 'linear-gradient(135deg, #F8C8C8 0%, #FFB6C1 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #FFB6C1 0%, #E2D1F9 100%)';
    return 'linear-gradient(135deg, #E2D1F9 0%, #D8BFD8 100%)';
  };

  const getScoreMood = (score: number) => {
    if (score >= 80) return { emoji: '💖', text: 'Really positive energy' };
    if (score >= 60) return { emoji: '💫', text: 'Generally good vibes' };
    if (score >= 40) return { emoji: '🌙', text: 'Proceed thoughtfully' };
    if (score >= 20) return { emoji: '⚠️', text: 'Caution advised' };
    return { emoji: '🚩', text: 'Major red flags' };
  };

  const mood = result ? getScoreMood(result.score) : null;

  // Social sharing function
  const shareToSocial = (platform: string) => {
    const shareText = `My VibeScore: ${result?.score} - ${mood?.text}\n\n"${result?.pullQuote}"\n\n${result?.feedback}\n\nAnalyzed by VibeScore.app 🔮`;
    const shareUrl = 'https://vibescore.app';
    
    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ 
        background: 'linear-gradient(135deg, #F8C8C8 0%, #E2D1F9 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header with Large Logo */}
      <div className="text-center mb-8">
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/vibescore-logo.png" 
            alt="VibeScore" 
            className="h-32 w-64 object-contain mb-2"
            style={{ minHeight: '120px', minWidth: '256px' }}
          />
        </div>
        <p 
          className="text-lg font-light tracking-wide max-w-md mx-auto mt-2"
          style={{ color: '#5a4a6e' }}
        >
          Your most experienced friend in the group chat
        </p>
      </div>

      {/* Input Section - Only show if no result */}
      {!result && (
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div 
              className="rounded-2xl p-6 shadow-lg transition-all duration-200"
              style={{
                background: '#FFFBFB',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#5a4a6e' }}>Drop the Receipts</h2>
              <p className="text-sm font-light mb-4" style={{ color: '#8a7a9e' }}>
                Paste that confusing text or upload a screenshot
              </p>
              
              {/* Text Input - Separate from file upload */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="The text that's living rent-free in your mind... 💭"
                className="w-full h-32 p-4 rounded-xl focus:outline-none text-base resize-none font-light transition-all placeholder-gray-400 border-2 mb-4"
                style={{
                  border: '2px solid #E2D1F9',
                  background: '#ffffff',
                  color: '#5a4a6e'
                }}
              />
              
              {/* File Upload - Simplified */}
              <div className="space-y-4">
                {/* File Input Button - Clear primary action */}
                <div className="text-center">
                  <label 
                    htmlFor="screenshot-upload"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50"
                    style={{
                      borderColor: isDragOver ? '#8B5FBF' : '#E2D1F9',
                      background: isDragOver ? 'rgba(139, 95, 191, 0.05)' : 'rgba(226, 209, 249, 0.1)',
                      color: '#5a4a6e'
                    }}
                  >
                    <span className="text-2xl">📸</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">Upload a screenshot</p>
                      <p className="text-xs" style={{ color: '#8a7a9e' }}>
                        Click to browse or drag & drop
                      </p>
                    </div>
                  </label>
                  
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* Drag & Drop Area - Visual only, uses same file input */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="hidden md:block p-4 rounded-xl border-2 border-dashed text-center transition-all"
                  style={{
                    borderColor: isDragOver ? '#8B5FBF' : 'transparent',
                    background: isDragOver ? 'rgba(139, 95, 191, 0.05)' : 'transparent',
                  }}
                >
                  <p className="text-sm" style={{ color: '#8a7a9e' }}>
                    Or drag & drop your screenshot here
                  </p>
                </div>
              </div>

              {/* Uploaded File Indicator */}
              {uploadedFile && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                    ✅ {uploadedFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setText('');
                    }}
                    className="text-xs text-green-600 hover:text-green-800 mt-1"
                  >
                    Remove file
                  </button>
                </div>
              )}

              <div className="text-right mt-2">
                <div 
                  className="text-xs font-light"
                  style={{ color: '#b0a0c8' }}
                >
                  {text.length}/500 • Your future self thanks you
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!text.trim() && !uploadedFile)}
              className="w-full py-4 text-base font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 border-2"
              style={{
                background: '#c18de5',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                  Reading the vibes...
                </span>
              ) : (
                '📱 Get the VibeScore'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="max-w-md w-full space-y-6">
          {/* Vibe Card - Wrapped for Instagram screenshot */}
          <div id="vibescore-result">
            <div
              className="relative rounded-3xl p-8 shadow-lg border-2"
              style={{
                background: '#FFFBFB',
                borderColor: 'rgba(255,255,255,0.8)'
              }}
            >
              <div className="absolute -top-3 -right-3">
                <div 
                  className="rounded-2xl px-5 py-3 font-medium shadow-md"
                  style={{
                    background: getScoreGradient(result.score),
                    border: '2px solid rgba(255,255,255,0.8)'
                  }}
                >
                  <div className="text-3xl font-light" style={{ color: '#5a4a6e' }}>{result.score}</div>
                  <div className="text-xs uppercase tracking-wider mt-1" style={{ color: '#5a4a6e' }}>Score</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center pt-4">
                  <div className="text-4xl mb-3">{mood?.emoji}</div>
                  <h1 className="text-xl font-light tracking-wide" style={{ color: '#5a4a6e' }}>{mood?.text}</h1>
                </div>

                <div 
                  className="text-center leading-relaxed rounded-2xl p-6"
                  style={{ 
                    background: 'rgba(248, 200, 200, 0.2)',
                    border: '1px solid #F8C8C8'
                  }}
                >
                  <p className="font-light italic text-base" style={{ color: '#5a4a6e' }}>
                    &ldquo;{result.pullQuote}&rdquo;
                  </p>
                </div>

                <div className="text-sm text-center leading-relaxed font-light px-2" style={{ color: '#8a7a9e' }}>
                  {result.feedback}
                </div>

                {/* Fixed Flags Display */}
                {result.flags && result.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {result.flags.slice(0, 3).map((flag, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2 rounded-full text-xs font-light"
                        style={{
                          background: 'rgba(226, 209, 249, 0.3)',
                          color: '#5a4a6e',
                          border: '1px solid #E2D1F9'
                        }}
                      >
                        {flag.emoji || '🚩'} {flag.type || flag}
                      </div>
                    ))}
                  </div>
                )}

                <div 
                  className="text-center text-xs pt-6 font-light tracking-wide"
                  style={{ 
                    color: '#b0a0c8',
                    borderTop: '1px solid #E2D1F9'
                  }}
                >
                  VibeScore — Clarity before you reply
                </div>
              </div>
            </div>
          </div>

          {/* Response Suggestions */}
          <div 
            className="rounded-3xl p-6 shadow-lg border-2"
            style={{
              background: '#FFFBFB',
              borderColor: 'rgba(255,255,255,0.8)'
            }}
          >
            <h3 className="font-light text-lg mb-6 text-center tracking-wide" style={{ color: '#5a4a6e' }}>How you might respond</h3>
            
            <div className="flex gap-3 mb-6 justify-center">
              {['empathetic', 'direct', 'playful'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setActiveTone(tone)}
                  className="px-5 py-2.5 rounded-full text-sm font-light capitalize transition-all tracking-wide"
                  style={
                    activeTone === tone
                      ? { 
                          background: '#c18de5', 
                          color: '#ffffff',
                          border: '1px solid #c18de5'
                        }
                      : { 
                          background: 'rgba(193, 141, 229, 0.1)', 
                          color: '#5a4a6e', 
                          border: '1px solid #c18de5' 
                        }
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
                  background: 'rgba(248, 200, 200, 0.1)',
                  border: '1px solid #F8C8C8'
                }}
              >
                <p className="text-base font-light leading-relaxed" style={{ color: '#5a4a6e' }}>
                  💬 {result.replies?.[activeTone]?.text || "No response available"}
                </p>
              </div>
              <p className="text-sm text-center font-light leading-relaxed px-2" style={{ color: '#8a7a9e' }}>
                {result.replies?.[activeTone]?.why || "This response matches the selected tone"}
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(result.replies?.[activeTone]?.text || '');
                setCopiedResponse(true);
                setTimeout(() => setCopiedResponse(false), 2000);
              }}
              className="w-full mt-6 py-4 px-6 rounded-2xl shadow-md transition-all duration-200 tracking-wide font-semibold border-2"
              style={{
                background: '#c18de5',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              {copiedResponse ? 'Copied ✓' : 'Copy response'}
            </button>
          </div>
<div 
  className="rounded-3xl p-6 shadow-lg border-2"
  style={{
    background: '#FFFBFB',
    borderColor: 'rgba(255,255,255,0.8)'
  }}
>
  <h3 className="font-light text-lg mb-4 text-center tracking-wide" style={{ color: '#5a4a6e' }}>This Vibe is Share-Worthy</h3>
  
  <div className="text-center space-y-4">
    <div className="text-3xl">📸</div>
    
    <p className="text-sm font-light leading-relaxed px-2" style={{ color: '#8a7a9e' }}>
      Screenshot this result and share it with your group chat - they need to see this read
    </p>

    
  </div>
</div>
          {/* Back Button */}
          <button
            onClick={() => {
              setResult(null);
              setText('');
              setUploadedFile(null);
            }}
            className="w-full py-3 rounded-2xl transition-all duration-200 tracking-wide font-light border-2"
            style={{
              background: 'transparent',
              color: '#8a7a9e',
              borderColor: 'rgba(255,255,255,0.5)'
            }}
          >
            ← Analyze another text
          </button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white bg-opacity-50 border border-white border-opacity-30">
          <div className="text-lg">🔒</div>
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: '#5a4a6e' }}>
              Your secrets are safe with us
            </p>
            <p className="text-xs" style={{ color: '#8a7a9e' }}>
              We're the friend who never screenshots. Analysis happens in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}