// MiniMax Music Generation API
// https://platform.minimaxi.com/docs/llms.txt

export interface GenerateMusicRequest {
  model: 'music-2.6' | 'music-cover' | 'music-2.6-free' | 'music-cover-free';
  prompt: string;
  lyrics: string;
  stream?: boolean;
  output_format?: 'url' | 'hex';
  audio_setting?: {
    sample_rate?: number;
    bitrate?: number;
    format?: 'mp3' | 'wav' | 'pcm';
  };
  lyrics_optimizer?: boolean;
  is_instrumental?: boolean;
}

export interface GenerateMusicResponse {
  data: {
    audio?: string; // hex encoded audio when output_format=hex
    status: number; // 1: processing, 2: done
  };
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

export async function generateMusic(
  req: GenerateMusicRequest
): Promise<GenerateMusicResponse> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error('MINIMAX_API_KEY is not set');

  const resp = await fetch('https://api.minimaxi.com/v1/music_generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ...req,
      lyrics_optimizer: false,
      output_format: req.output_format ?? 'url',
      audio_setting: req.audio_setting ?? {
        sample_rate: 44100,
        bitrate: 128000,
        format: 'mp3',
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`MiniMax API error: ${resp.status} ${text}`);
  }

  return resp.json();
}
