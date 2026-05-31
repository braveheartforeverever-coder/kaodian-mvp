'use client';

import { useState } from 'react';
import { useSongLibrary, SavedSong } from '@/lib/useSongLibrary';

export default function SongLibrary({ onPlay }: { onPlay: (song: SavedSong) => void }) {
  const { songs, remove, incrementPlay } = useSongLibrary();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (songs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--primary)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>歌单为空</div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>去创作你的第一首记忆歌曲吧</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>我的歌单</h2>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{songs.length} 首歌曲</p>
      </div>
      <div className="space-y-2">
        {songs.map((song, i) => (
          <div key={song.id}
            className="flex items-center gap-3 p-3.5 rounded-xl border transition-all group hover:-translate-y-0.5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <button onClick={() => { incrementPlay(song.id); onPlay(song); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: 'var(--primary)', boxShadow: '0 2px 8px rgba(59,130,246,0.25)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{song.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex gap-1">
                  {song.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{tag}</span>
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>播放 {song.playCount} 次</span>
              </div>
            </div>
            {confirmDelete === song.id ? (
              <div className="flex gap-1">
                <button onClick={() => { remove(song.id); setConfirmDelete(null); }}
                  className="text-[11px] px-3 py-1 rounded-lg font-medium" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>删除</button>
                <button onClick={() => setConfirmDelete(null)}
                  className="text-[11px] px-3 py-1 rounded-lg" style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}>取消</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(song.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2m1 0v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
