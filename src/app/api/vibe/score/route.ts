// src/app/api/vibe/score/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getVibeAnalysis } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const vibe = await getVibeAnalysis(text);
    return NextResponse.json(vibe);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze vibe.' }, { status: 500 });
  }
}
