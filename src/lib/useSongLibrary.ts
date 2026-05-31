'use client';

import { useState, useEffect } from 'react';

export interface SavedSong {
  id: string;
  title: string;
  lyrics: string;
  audioUrl: string;
  tags: string[];
  createdAt: number;
  playCount: number;
}

const STORAGE_KEY = 'kaodian-songs';

export function useSongLibrary() {
  const [songs, setSongs] = useState<SavedSong[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSongs(JSON.parse(saved));
  }, []);

  const save = (song: Omit<SavedSong, 'id' | 'createdAt' | 'playCount'>) => {
    const newSong: SavedSong = {
      ...song,
      id: Date.now().toString(),
      createdAt: Date.now(),
      playCount: 0,
    };
    const updated = [newSong, ...songs];
    setSongs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSong;
  };

  const remove = (id: string) => {
    const updated = songs.filter((s) => s.id !== id);
    setSongs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const incrementPlay = (id: string) => {
    const updated = songs.map((s) =>
      s.id === id ? { ...s, playCount: s.playCount + 1 } : s
    );
    setSongs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { songs, save, remove, incrementPlay };
}
