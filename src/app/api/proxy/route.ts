import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  try {
    const resp = await fetch(url);
    if (!resp.ok) return NextResponse.json({ error: 'fetch failed' }, { status: 502 });

    const buffer = await resp.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'proxy error' }, { status: 500 });
  }
}
