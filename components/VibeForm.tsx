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
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    analyzeText(text);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploadedFile(file);
    setLoading(true);
    const { data: { text: extracted } } = await Tesseract.recognize(file, 'eng');
    analyzeText(extracted);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-6">VibeScore</h1>

      <div className="w-full max-w-xl">
        {/* Advanced Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="advancedMode"
            checked={advancedMode}
            onChange={() => setAdvancedMode(!advancedMode)}
            className="accent-purple-600"
          />
          <label htmlFor="advancedMode" className="text-sm">
            Advanced Mode: Try screenshot input (Beta)
          </label>
        </div>

        {/* Screenshot Upload Zone */}
        {advancedMode && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full border-2 border-dashed p-4 rounded-xl text-center transition mb-4 cursor-pointer ${
              isDragOver ? 'border-purple-400 bg-purple-50 dark:bg-purple-900' : 'border-gray-300 bg-white dark:bg-dark-card'
            }`}
            onClick={() => document.getElementById('screenshot-upload')?.click()}
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Drag & drop a screenshot, or click to upload
            </p>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 opacity-0"
            />
            {uploadedFile && (
              <p className="text-xs mt-2 text-purple-600 dark:text-purple-300">
                Uploaded: {uploadedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Text Input + Submit (for manual mode) */}
        {!advancedMode && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your conversation here…"
              className="w-full h-40 p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm resize-none dark:bg-dark-card dark:border-dark-border dark:text-white"
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
        )}
      </div>

      {/* VibeScore Output */}
      {result && (
        <div className="mt-8 w-full max-w-xl">
          <VibeScoreCard
  score={result.score}
  label={result.label}
  labelCategory={result.labelCategory}
  relationshipType={result.relationshipType}
  confidence={result.confidence}
  confidenceLevel={result.confidenceLevel}
  flags={result.flags}
  emojiSummary={result.emojiSummary}
  pullQuote={result.pullQuote}
  feedback={result.feedback}
  suggestions={result.suggestions}
/>

        </div>
      )}
    </div>
  );
}
