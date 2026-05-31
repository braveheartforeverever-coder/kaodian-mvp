import { NextRequest, NextResponse } from 'next/server';
import { generateMusic } from '@/lib/minimax';

export async function POST(req: NextRequest) {
  try {
    const { lyrics, prompt } = await req.json();

    if (!lyrics || typeof lyrics !== 'string') {
      return NextResponse.json(
        { error: '请提供歌词内容' },
        { status: 400 }
      );
    }

    const result = await generateMusic({
      model: 'music-2.6-free',
      prompt: prompt || '口诀记忆歌,节奏明快,朗朗上口,适合循环播放',
      lyrics,
      output_format: 'url',
    });

    if (result.base_resp.status_code !== 0) {
      return NextResponse.json(
        { error: result.base_resp.status_msg },
        { status: 500 }
      );
    }

    // 如果还在合成中，返回状态让前端轮询
    if (result.data.status === 1) {
      return NextResponse.json({ status: 'processing' });
    }

    return NextResponse.json({
      status: 'done',
      audio_url: result.data.audio,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '音乐生成失败';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
