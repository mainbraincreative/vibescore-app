'use client';

import { useState } from 'react';
import Tesseract from 'tesseract.js';
import VibeScoreCard from './VibeScoreCard';

export default function VibeForm() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const analyzeText = async (input: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setResult(data);
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
    if (!text.trim()) return;
    analyzeText(text);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploadedFile(file);
    setLoading(true);
    try {
      const { data: { text: extracted } } = await Tesseract.recognize(file, 'eng');
      analyzeText(extracted);
    } catch (error) {
      console.error('OCR failed:', error);
      setLoading(false);
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

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{ background: 'linear-gradient(165deg, #faf6f3 0%, #f5ede8 100%)' }}
    >
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/vibescore-logo.png" 
            alt="VibeScore" 
            className="h-16 w-16 object-contain"
          />
          <h1 
            className="text-5xl font-light tracking-wide"
            style={{ color: '#6a5a52' }}
          >
            VibeScore
          </h1>
        </div>
        <p 
          className="text-sm font-light tracking-wide max-w-md mx-auto"
          style={{ color: '#9a8a82' }}
        >
          Your AI wingwoman. Get instant clarity on his texts and never second-guess a message again.
        </p>
      </div>

      <div className="w-full max-w-xl">
        {/* Advanced Mode Toggle */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="advancedMode"
              checked={advancedMode}
              onChange={() => setAdvancedMode(!advancedMode)}
              className="sr-only peer"
            />
            <div 
              className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                background: advancedMode ? '#c9b5a8' : '#e8ddd5'
              }}
            ></div>
          </div>
          <label 
            htmlFor="advancedMode" 
            className="text-sm font-light"
            style={{ color: '#7a6a62' }}
          >
            📸 Screenshot Mode
          </label>
        </div>

        {/* Screenshot Upload Zone */}
        {advancedMode && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative w-full p-8 rounded-2xl text-center transition mb-6 cursor-pointer border-2 border-dashed"
            style={{
              borderColor: isDragOver ? '#c9b5a8' : '#e8ddd5',
              background: isDragOver ? '#faf5f0' : '#ffffff'
            }}
            onClick={() => document.getElementById('screenshot-upload')?.click()}
          >
            <div className="text-3xl mb-3">📸</div>
            <p 
              className="text-sm font-light mb-1"
              style={{ color: '#7a6a62' }}
            >
              Drop a screenshot or click to upload
            </p>
            <p 
              className="text-xs font-light"
              style={{ color: '#9a8a82' }}
            >
              We'll read the text and analyze the vibe
            </p>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {uploadedFile && (
              <p 
                className="text-xs mt-3 font-medium"
                style={{ color: '#c9b5a8' }}
              >
                ✅ {uploadedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Text Input + Submit */}
        {!advancedMode && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste that confusing text here... 💭"
                className="w-full h-40 p-6 rounded-2xl shadow-sm focus:outline-none text-base resize-none font-light transition-all placeholder-gray-400"
                style={{
                  border: '1px solid #e8ddd5',
                  background: '#ffffff',
                  color: '#6a5a52'
                }}
                required
              />
              <div 
                className="absolute bottom-3 right-3 text-xs font-light"
                style={{ color: '#b0a098' }}
              >
                {text.length}/500
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full py-4 text-base font-light rounded-2xl transition-all duration-200 disabled:opacity-50 tracking-wide shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
              style={{
                background: '#c9b5a8',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Reading the vibes...
                </span>
              ) : (
                '✨ Get My VibeScore'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="mt-12 w-full max-w-md">
          <VibeScoreCard vibe={result} />
        </div>
      )}
    </div>
  );
}