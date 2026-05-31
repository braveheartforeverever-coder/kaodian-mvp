import { NextRequest, NextResponse } from 'next/server';
import { generateLyrics } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { knowledgePoint } = await req.json();

    if (!knowledgePoint || typeof knowledgePoint !== 'string') {
      return NextResponse.json(
        { error: '请提供考点内容' },
        { status: 400 }
      );
    }

    const lyrics = await generateLyrics(knowledgePoint);

    return NextResponse.json({ lyrics });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '歌词生成失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
