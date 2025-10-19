// src/app/page.tsx - MOBILE SCREENSHOT OPTIMIZED
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTone, setActiveTone] = useState('empathetic');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const MAX_FILES = 3; // Maximum file limit

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
    
    // If we have uploaded files but no manual text, use OCR results
    if (uploadedFiles.length > 0 && !text.trim()) {
      // Files are already being processed by handleFileUpload, which calls analyzeText
      return;
    }
    
    // If we have manual text, analyze it
    if (text.trim()) {
      analyzeText(text);
    } else if (uploadedFiles.length === 0) {
      alert('Please enter text or upload screenshots.');
    }
    // Note: If both text and files exist, we prioritize the manual text
  };

  const handleFileUpload = async (files: File[]) => {
    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + files.length > MAX_FILES) {
      const excessFiles = (uploadedFiles.length + files.length) - MAX_FILES;
      alert(`Hold up, bestie - ${MAX_FILES} screenshots max. Remove ${excessFiles} file(s) first.`);
      return;
    }
    
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please upload image files only');
      return;
    }
    
    console.log('Files selected:', imageFiles.map(f => f.name));
    setUploadedFiles(prev => [...prev, ...imageFiles]);
    setLoading(true);
    
    // Reset file input
    const fileInput = document.getElementById('screenshot-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    try {
      let allExtractedText = '';
      
      // Process all files with OCR
      for (const file of imageFiles) {
        console.log('Processing:', file.name);
        const { data: { text: extracted } } = await Tesseract.recognize(file, 'eng');
        allExtractedText += extracted + '\n\n';
      }
      
      console.log('All OCR completed, extracted text length:', allExtractedText.length);
      // DON'T setText here - keep the textarea clean for manual input
      setLoading(false);
      
      // Auto-analyze the OCR text directly
      setTimeout(() => {
        analyzeText(allExtractedText);
      }, 100);
      
    } catch (error) {
      console.error('OCR failed:', error);
      setLoading(false);
      // Remove the failed files
      setUploadedFiles(prev => prev.filter(f => !files.includes(f)));
      alert('Failed to read text from some images. Please try again.');
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
    if (files.length > 0) {
      handleFileUpload(files);
    }
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

  // PRIORITY 1: Dynamic score colors like Spotify Wrapped
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  // PRIORITY 4: Color-coded flag system
  const getFlagColor = (flag: any) => {
    const flagText = flag.type || flag.toString().toLowerCase();
    const redFlags = ['gaslighting', 'manipulation', 'toxic', 'red flag', 'controlling', 'abusive', 'frustration'];
    const yellowFlags = ['mixed signals', 'passive aggressive', 'unclear', 'confusing', 'vague'];
    const greenFlags = ['healthy', 'respectful', 'clear', 'positive', 'supportive'];
    
    if (redFlags.some(f => flagText.toLowerCase().includes(f))) 
      return 'bg-red-500 text-white border-red-600 shadow-lg';
    if (yellowFlags.some(f => flagText.toLowerCase().includes(f))) 
      return 'bg-yellow-500 text-black border-yellow-600 shadow-lg';
    if (greenFlags.some(f => flagText.toLowerCase().includes(f))) 
      return 'bg-green-500 text-white border-green-600 shadow-lg';
    
    return 'bg-purple-500 text-white border-purple-600 shadow-lg';
  };

  // Social sharing function
  const shareToSocial = (platform: string) => {
    const shareText = `My VibeScore: ${result?.score} - ${mood?.text}\n\n"${result?.pullQuote}"\n\n${result?.feedback}\n\nAnalyzed by GetVibeScore.com 🔮`;
    const shareUrl = 'https://www.getvibescore.com';
    
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
      <div className="text-center mb-4">
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/vibescore-logo.png" 
            alt="VibeScore" 
            className="h-32 w-64 object-contain mb-0"
            style={{ minHeight: '120px', minWidth: '256px' }}
          />
        </div>
        <p 
          className="text-lg font-light tracking-wide max-w-md mx-auto mt-0"
          style={{ color: '#5a4a6e' }}
        >
          Spot the red flags before you ignore them
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
                Paste text OR upload screenshots
              </p>
              
              {/* Text Input - Separate from file upload */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="The convo that's living rent-free in your mind... 💭"
                className="w-full h-32 p-4 rounded-xl focus:outline-none text-base resize-none font-light transition-all placeholder-gray-400 border-2 mb-4"
                style={{
                  border: '2px solid #E2D1F9',
                  background: '#ffffff',
                  color: '#5a4a6e'
                }}
              />
              
              {/* File Upload - Multiple files enabled */}
              <div className="space-y-4">
                {/* File Input Button - Clear primary action */}
                <div className="text-center">
                  <label 
                    htmlFor="screenshot-upload"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-purple-50 w-full justify-center"
                    style={{
                      borderColor: isDragOver ? '#8B5FBF' : '#E2D1F9',
                      background: isDragOver ? 'rgba(139, 95, 191, 0.1)' : 'rgba(226, 209, 249, 0.1)',
                      color: '#5a4a6e'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <span className="text-2xl">📸</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">Upload screenshots</p>
                      <p className="text-xs" style={{ color: '#8a7a9e' }}>
                        Click to browse or drag & drop (max {MAX_FILES} images)
                      </p>
                    </div>
                  </label>
                  
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        handleFileUpload(files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* Multiple files display */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-green-800">
                      ✅ {uploadedFiles.length}/{MAX_FILES} screenshot(s) ready
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-green-700 bg-green-50 p-2 rounded">
                          <span className="flex-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="text-red-600 hover:text-red-800 ml-2 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles([]);
                        setText('');
                      }}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Clear all files
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!text.trim() && uploadedFiles.length === 0)}
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

      {/* Results Section - MOBILE SCREENSHOT OPTIMIZED */}
      {result && (
        <div className="w-full max-w-md mx-auto px-4 space-y-6">
          {/* Vibe Card - OPTIMIZED FOR MOBILE SCREENSHOTS */}
          <div 
            id="vibescore-result"
            className="min-h-[580px] flex flex-col justify-between rounded-3xl p-6 shadow-2xl border-2 backdrop-blur-sm mx-auto"
            style={{
              background: 'linear-gradient(135deg, #FFFBFB 0%, #FEF7FF 100%)',
              borderColor: 'rgba(255,255,255,0.9)',
              maxWidth: '400px',
              width: '100%'
            }}
          >
            <div className="space-y-4">
              {/* PRIORITY 1: HERO SCORE - Centered and dramatic */}
              <div className="text-center">
                <div className={`inline-flex flex-col items-center justify-center p-4 rounded-3xl border-2 ${getScoreBgColor(result.score)}`}>
                  {/* Dynamic score with color zones */}
                  <div className={`text-6xl font-black ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className="text-md font-bold uppercase tracking-widest mt-1" style={{ color: '#5a4a6e' }}>
                    VibeScore
                  </div>
                </div>
                
                {/* Mood with larger emoji */}
                <div className="mt-3">
                  <div className="text-3xl mb-1">{mood?.emoji}</div>
                  <h1 className="text-xl font-bold" style={{ color: '#5a4a6e' }}>
                    {mood?.text}
                  </h1>
                </div>
              </div>

              {/* DYNAMIC EMOJI STRIP based on vibe score */}
              <div className="flex justify-center gap-2 my-4 text-2xl">
                {(() => {
                  const score = result.score;
                  const flags = result.flags || [];
                  
                  // Check for specific red flags that should override the score-based emojis
                  const hasRedFlags = flags.some(flag => 
                    (flag.type || flag.toString()).toLowerCase().includes('gaslighting') ||
                    (flag.type || flag.toString()).toLowerCase().includes('toxic') ||
                    (flag.type || flag.toString()).toLowerCase().includes('manipulation')
                  );
                  
                  const hasGreenFlags = flags.some(flag => 
                    (flag.type || flag.toString()).toLowerCase().includes('healthy') ||
                    (flag.type || flag.toString()).toLowerCase().includes('positive') ||
                    (flag.type || flag.toString()).toLowerCase().includes('respectful')
                  );

                  let emojis: string[];
                  
                  if (hasRedFlags) {
                    emojis = ['🚩', '💀', '🏃‍♀️', '😵', '🆘']; // Major red flags
                  } else if (score >= 80 || hasGreenFlags) {
                    emojis = ['💖', '✨', '🌟', '🎉', '🥰']; // Great vibes
                  } else if (score >= 60) {
                    emojis = ['💫', '😊', '👍', '👌', '💕']; // Good vibes
                  } else if (score >= 40) {
                    emojis = ['🤔', '😐', '🧐', '💭', '⚠️']; // Mixed signals
                  } else if (score >= 20) {
                    emojis = ['😬', '😟', '🤨', '🚩', '⚠️']; // Concerning
                  } else {
                    emojis = ['🚩', '💀', '🫠', '😵', '🏃‍♀️']; // Run away
                  }
                  
                  return emojis.map((emoji, index) => (
                    <span key={index} className="animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                      {emoji}
                    </span>
                  ));
                })()}
              </div>

              {/* PRIORITY 2: PULL QUOTE as DISPLAY ELEMENT */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <div className="text-xl font-black leading-tight tracking-wide">
                    "{result.pullQuote}"
                  </div>
                </div>
              </div>

              {/* Feedback with better typography */}
              <div className="text-center">
                <p className="text-sm leading-relaxed font-medium" style={{ color: '#5a4a6e' }}>
                  {result.feedback}
                </p>
              </div>

              {/* PRIORITY 4: COLOR-CODED FLAGS with visual impact */}
              {result.flags && result.flags.length > 0 && (
                <div>
                  <h3 className="text-center text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#8a7a9e' }}>
                    Flags Detected
                  </h3>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {result.flags.slice(0, 3).map((flag, idx) => (
                      <span 
                        key={idx} 
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getFlagColor(flag)}`}
                      >
                        {flag.emoji || '🚩'} {flag.type || flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Watermark - Always visible at bottom */}
            <div className="text-center pt-3 border-t border-gray-200 mt-4">
              <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: '#8B5FBF' }}>
                GetVibeScore.com
              </div>
              <div className="text-xs" style={{ color: '#b0a0c8' }}>
                Stop guessing, start knowing 👉
              </div>
            </div>
          </div>

          {/* Response Suggestions */}
          <div 
            className="rounded-3xl p-6 shadow-2xl border-2 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, #FFFBFB 0%, #FEF7FF 100%)',
              borderColor: 'rgba(255,255,255,0.9)'
            }}
          >
            <h3 className="font-bold text-xl mb-6 text-center tracking-wide" style={{ color: '#5a4a6e' }}>
              How you might respond
            </h3>
            
            <div className="flex gap-2 mb-6 justify-center">
              {[
                { key: 'empathetic', label: '💖 Empathetic', emoji: '💖' },
                { key: 'direct', label: '💫 Direct', emoji: '💫' },
                { key: 'playful', label: '😄 Playful', emoji: '😄' }
              ].map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => setActiveTone(key)}
                  className={`px-4 py-3 rounded-full text-sm font-bold transition-all tracking-wide border-2 ${
                    activeTone === key
                      ? 'bg-purple-600 text-white border-purple-700 shadow-lg scale-105'
                      : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-base mr-1">{emoji}</span>
                  {label.split(' ')[1]}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div 
                className="rounded-2xl p-6 relative"
                style={{
                  background: 'linear-gradient(135deg, #F8C8C8 0%, #E2D1F9 100%)',
                  border: '2px solid rgba(255,255,255,0.8)'
                }}
              >
                <div className="text-2xl absolute -top-3 -left-3">💬</div>
                <p className="text-lg font-semibold leading-relaxed text-center" style={{ color: '#5a4a6e' }}>
                  {result.replies?.[activeTone]?.text || "No response available"}
                </p>
              </div>
              
              <p className="text-base text-center font-medium leading-relaxed px-2" style={{ color: '#8a7a9e' }}>
                {result.replies?.[activeTone]?.why || "This response matches the selected tone"}
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(result.replies?.[activeTone]?.text || '');
                setCopiedResponse(true);
                setTimeout(() => setCopiedResponse(false), 2000);
              }}
              className="w-full mt-6 py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 tracking-wide font-bold border-2 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #c18de5 0%, #8B5FBF 100%)',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              {copiedResponse ? '📋 Copied to clipboard!' : '📋 Copy this response'}
            </button>
          </div>

          {/* Share Section */}
          <div 
            className="rounded-3xl p-6 shadow-2xl border-2 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, #FFFBFB 0%, #FEF7FF 100%)',
              borderColor: 'rgba(255,255,255,0.9)'
            }}
          >
            <h3 className="font-bold text-xl mb-4 text-center tracking-wide" style={{ color: '#5a4a6e' }}>
              Don't Keep This to Yourself 📸
            </h3>
            
            <div className="text-center space-y-4">
              <div className="text-4xl animate-pulse">✨</div>
              
              <p className="text-base font-medium leading-relaxed px-2" style={{ color: '#8a7a9e' }}>
                Screenshot this. You know who needs it
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => {
              setResult(null);
              setText('');
              setUploadedFiles([]);
            }}
            className="w-full py-4 rounded-2xl transition-all duration-200 tracking-wide font-bold border-2 hover:scale-105"
            style={{
              background: 'transparent',
              color: '#8a7a9e',
              borderColor: 'rgba(255,255,255,0.5)'
            }}
          >
            ← Analyze another conversation
          </button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white bg-opacity-50 border border-white border-opacity-30">
          <div className="text-lg">🔒</div>
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: '#5a4a6e' }}>
              Nothing is stored or saved
            </p>
            <p className="text-xs" style={{ color: '#8a7a9e' }}>
              Your conversation's analyzed once, then it's permanently deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}