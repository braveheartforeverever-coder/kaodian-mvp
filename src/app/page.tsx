'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { examPoints, KnowledgePoint } from '@/data/exam-points';
import { useApp } from '@/components/AppProvider';
import { useSongLibrary, SavedSong } from '@/lib/useSongLibrary';
import SongLibrary from '@/components/SongLibrary';

type Step = 'select' | 'lyrics' | 'playing';
type Tab = 'generate' | 'library';

const isSectionLine = (line: string) => /^[\[【(（].*[\]】)）]$/.test(line.trim());
const stripSection = (line: string) => line.trim().replace(/^[\[【(（]|[\]】)）]$/g, '');

/* ----------------------------------------------------------------------------
 * Icons — pure SVG, no emoji. Inherit color via currentColor.
 * ------------------------------------------------------------------------- */
const Icon = {
  note: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  check: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  arrowLeft: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  search: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  spinner: ({ size = 18 }: { size?: number }) => (
    <svg className="kd-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  sparkles: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2" />
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  play: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
  ),
  pause: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
  ),
  back10: ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" /></svg>
  ),
  fwd10: ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62c-1.39-1.16-3.16-1.88-5.12-1.88-3.54 0-6.55 2.31-7.6 5.5l-2.37-.78C2.92 11.03 6.85 8 11.5 8z" /></svg>
  ),
  settings: ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
    </svg>
  ),
  library: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5v14M8 5v14m5-12l6 1.5-3 12L10 19" />
    </svg>
  ),
  alert: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  brain: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 0 5 2.5 2.5 0 0 0 5 0V5z" />
      <path d="M12 5a3 3 0 0 1 3 3 3 3 0 0 1 3 3 3 3 0 0 1 0 5 2.5 2.5 0 0 1-5 0V5z" />
    </svg>
  ),
  bolt: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  repeat: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
};

export default function Home() {
  const { t } = useApp();
  const { save } = useSongLibrary();
  const [tab, setTab] = useState<Tab>('generate');
  const [selectedPoint, setSelectedPoint] = useState<KnowledgePoint | null>(null);
  const [customText, setCustomText] = useState('');
  const [query, setQuery] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
    };
  }, [audioUrl]);

  const handleSelectPoint = (point: KnowledgePoint) => {
    setSelectedPoint(point);
    setCustomText(point.content);
    setSongTitle(point.title);
    setError('');
  };

  const handleGenerateLyrics = async () => {
    const text = customText.trim();
    if (!text) { setError('请输入考点内容'); return; }
    setLoading(true); setError('');
    try {
      const resp = await fetch('/api/lyrics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledgePoint: text }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setLyrics(data.lyrics); setStep('lyrics');
    } catch (e) { setError(e instanceof Error ? e.message : '生成失败'); }
    finally { setLoading(false); }
  };

  const handleGenerateMusic = async () => {
    setLoading(true); setError('');
    try {
      const resp = await fetch('/api/music', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics, prompt: '流行,女声,节奏明快' }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setAudioUrl(`/api/proxy?url=${encodeURIComponent(data.audio_url)}`);
      save({ title: songTitle || '未命名', lyrics, audioUrl: `/api/proxy?url=${encodeURIComponent(data.audio_url)}`, tags: selectedPoint?.tags || [] });
      setStep('playing');
    } catch (e) { setError(e instanceof Error ? e.message : '生成失败'); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setSelectedPoint(null); setCustomText(''); setLyrics('');
    setAudioUrl(''); setSongTitle(''); setStep('select'); setError('');
  };

  const handlePlayFromLibrary = (song: SavedSong) => {
    setLyrics(song.lyrics); setAudioUrl(song.audioUrl);
    setSongTitle(song.title); setSelectedPoint(null);
    setStep('playing'); setTab('generate');
  };

  const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : '0:00');

  const filteredPoints = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return examPoints;
    return examPoints.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  const lyricLines = useMemo(() => lyrics.split('\n'), [lyrics]);
  const contentLineIndices = useMemo(
    () => lyricLines.map((l, i) => ({ l, i })).filter((x) => x.l.trim() && !isSectionLine(x.l)).map((x) => x.i),
    [lyricLines]
  );

  const activeLineIndex = useMemo(() => {
    if (!duration || !contentLineIndices.length) return -1;
    const ratio = Math.min(0.999, Math.max(0, currentTime / duration));
    const pos = Math.floor(ratio * contentLineIndices.length);
    return contentLineIndices[Math.min(contentLineIndices.length - 1, pos)];
  }, [currentTime, duration, contentLineIndices]);

  useEffect(() => {
    if (step !== 'playing' || activeLineIndex < 0) return;
    const el = lineRefs.current[activeLineIndex];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLineIndex, step]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const stepIndex = ['select', 'lyrics', 'playing'].indexOf(step);
  const overLimit = customText.length > 300;

  return (
    <div className="kd-app">
      {/* ------------------------------------------------------------ Sidebar */}
      <aside className="kd-sidebar">
        <div className="kd-sidebar-header">
          <span className="kd-brand-mark"><Icon.note size={22} /></span>
          <div className="kd-brand-text">
            <strong>考点成歌</strong>
            <em>把考点唱进脑子里</em>
          </div>
        </div>

        <nav className="kd-sidebar-nav">
          <button className={`kd-sidebar-item ${tab === 'generate' ? 'is-active' : ''}`} onClick={() => { setTab('generate'); handleReset(); }}>
            <Icon.sparkles size={18} />
            <span>创作</span>
          </button>
          <button className={`kd-sidebar-item ${tab === 'library' ? 'is-active' : ''}`} onClick={() => setTab('library')}>
            <Icon.library size={18} />
            <span>我的歌单</span>
          </button>
          <button className="kd-sidebar-item">
            <Icon.repeat size={18} />
            <span>历史记录</span>
          </button>
        </nav>

        <div className="kd-sidebar-user">
        </div>
      </aside>

      {/* Settings button - fixed position, always visible */}
      <div style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 80 }}>
        <SettingsButton />
      </div>

      {/* ------------------------------------------------------------ Main */}
      <div className="kd-content">
        {/* Top bar with step indicator and buttons */}
        <header className="kd-topbar">
          <StepIndicator current={stepIndex} />
          <div className="kd-topbar-actions">
            <button className="kd-topbar-btn kd-topbar-btn-primary" onClick={() => { setTab('generate'); handleReset(); }}>
              <Icon.sparkles size={16} /> AI 创作
            </button>
            <button className="kd-topbar-btn" onClick={() => setTab('library')}>
              <Icon.library size={16} /> 我的歌单
            </button>
          </div>
        </header>

        <main className="kd-main">
          {tab === 'library' ? (
            <div className="kd-fade">
              <div className="kd-section-head">
                <h2>我的歌单</h2>
                <p>保存的记忆歌曲，随时回放复习</p>
              </div>
              <SongLibrary onPlay={handlePlayFromLibrary} />
            </div>
          ) : (
            <div className="kd-stack">
              {/* ---- STEP 1 body */}
              {step === 'select' && (
                <div className="kd-select kd-fade">
                  {/* left: catalogue */}
                  <div className="kd-select-main">
                    <div className="kd-select-bar">
                      <div className="kd-section-head">
                        <h2>选择学习素材</h2>
                        <p>从题库挑选，或在右侧直接粘贴自己的考点</p>
                      </div>
                      <div className="kd-search">
                        <span className="kd-search-icon"><Icon.search /></span>
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="搜索考点、标签或关键词..."
                        />
                        {query && (
                          <button className="kd-search-clear" onClick={() => setQuery('')} aria-label="清空">×</button>
                        )}
                      </div>
                    </div>

                    {filteredPoints.length === 0 ? (
                      <div className="kd-empty">
                        <span className="kd-empty-icon"><Icon.search size={26} /></span>
                        <p className="kd-empty-title">没有匹配的考点</p>
                        <p className="kd-empty-sub">换个关键词，或直接在右侧粘贴你的内容</p>
                      </div>
                    ) : (
                      <div className="kd-grid">
                        {filteredPoints.map((point, idx) => {
                          const active = selectedPoint?.id === point.id;
                          const colorClass = `kd-card-color-${idx % 6}`;
                          const cardIcons = [
                            <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                            <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>,
                            <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                            <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>,
                            <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
                            <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
                          ];
                          return (
                            <button
                              key={point.id}
                              className={`kd-card ${active ? 'is-active' : ''} ${colorClass}`}
                              onClick={() => handleSelectPoint(point)}
                            >
                              {active && <span className="kd-card-badge"><Icon.check size={15} /></span>}
                              <div className="kd-card-icon">{cardIcons[idx % 6]}</div>
                              <div className="kd-card-tags">
                                {point.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="kd-tag">{tag}</span>
                                ))}
                              </div>
                              <h3 className="kd-card-title">{point.title}</h3>
                              <p className="kd-card-content">{point.content}</p>
                              <span className="kd-card-arrow"><Icon.arrowLeft size={14} /></span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button className="kd-refresh-btn" onClick={() => setQuery('')}>
                      <Icon.repeat size={16} /> 换一批素材
                    </button>
                  </div>

                  {/* right: compose panel */}
                  <aside className="kd-panel-wrap">
                    <div className="kd-panel">
                      <div className="kd-section-head">
                        <h3>创作面板</h3>
                        <p>确认要谱成歌曲的内容</p>
                      </div>

                      <div className="kd-field">
                        <label className="kd-label">歌曲标题</label>
                        <div className="kd-input-wrap">
                          <input
                            className="kd-input"
                            value={songTitle}
                            onChange={(e) => setSongTitle(e.target.value)}
                            placeholder="给这首歌起个名字"
                          />
                          <span className="kd-char-count">{songTitle.length} / 30</span>
                        </div>
                      </div>

                      <div className="kd-field">
                        <label className="kd-label">考点内容</label>
                        <textarea
                          className={`kd-textarea ${overLimit ? 'is-over' : ''}`}
                          value={customText}
                          onChange={(e) => { setCustomText(e.target.value); if (error) setError(''); }}
                          placeholder="在此粘贴任意知识点、法条、公式或时间线..."
                        />
                        <div className="kd-field-meta">
                          <span>建议 50 – 300 字</span>
                          <span className={overLimit ? 'is-warn' : ''}>{customText.length} / 500</span>
                        </div>
                      </div>

                      {error && (
                        <div className="kd-error">
                          <Icon.alert size={15} />
                          <span>{error}</span>
                        </div>
                      )}

                      <PrimaryButton
                        tone="primary"
                        onClick={handleGenerateLyrics}
                        disabled={loading || !customText.trim()}
                        loading={loading}
                        loadingText="AI 正在构思歌词…"
                        icon={<Icon.sparkles size={18} />}
                      >
                        ✨ 生成记忆歌词
                      </PrimaryButton>

                      <div className="kd-hint">
                        <span className="kd-hint-icon">ℹ️</span>
                        <p>AI 会提取核心考点，编成押韵、朗朗上口的歌词，帮你把知识唱进长期记忆。</p>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {/* ============================================== STEP 2 · LYRICS */}
            {step === 'lyrics' && (
              <div className="kd-center kd-fade">
                <BackButton onClick={() => setStep('select')}>重新挑选素材</BackButton>

                <div className="kd-sheet">
                  <div className="kd-sheet-head">
                    <div className="kd-sheet-id">
                      <span className="kd-sheet-mark"><Icon.note size={26} /></span>
                      <div>
                        <h2>{songTitle || '未命名作品'}</h2>
                        <p>歌词已生成 · 等待谱曲</p>
                      </div>
                    </div>
                    {selectedPoint && selectedPoint.tags.length > 0 && (
                      <div className="kd-card-tags">
                        {selectedPoint.tags.map((tag) => (
                          <span key={tag} className="kd-tag kd-tag-outline">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="kd-sheet-body">
                    <div className="kd-lyrics-box kd-scroll">
                      {lyricLines.map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={i} className="kd-lyric-gap" />;
                        if (isSectionLine(trimmed)) {
                          return <div key={i} className="kd-lyric-section">{stripSection(line)}</div>;
                        }
                        return <div key={i} className="kd-lyric-line">{line}</div>;
                      })}
                    </div>

                    <PrimaryButton
                      tone="success"
                      onClick={handleGenerateMusic}
                      disabled={loading}
                      loading={loading}
                      loadingText="AI 正在作曲演唱…"
                      icon={<Icon.note size={18} />}
                    >
                      合成全曲并保存
                    </PrimaryButton>
                    <p className="kd-eta">预计耗时 30 – 45 秒</p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================= STEP 3 · PLAYING */}
            {step === 'playing' && (
              <div className="kd-center-sm kd-fade">
                <BackButton onClick={handleReset}>开始新创作</BackButton>

                <div className="kd-player">
                  {/* cover */}
                  <div className="kd-cover">
                    <div className="kd-cover-glow" />
                    <div className={`kd-cover-disc ${isPlaying ? 'is-playing' : ''}`}>
                      <Icon.note size={46} />
                      {isPlaying && <span className="kd-cover-ring" />}
                    </div>
                    <div className="kd-eq">
                      {[0.4, 0.7, 0.5, 1, 0.6, 0.9, 0.3, 0.6, 0.45].map((h, i) => (
                        <span
                          key={i}
                          style={{
                            height: isPlaying ? `${h * 100}%` : '18%',
                            animationDelay: `${i * 0.09}s`,
                            animationPlayState: isPlaying ? 'running' : 'paused',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="kd-player-body">
                    <div className="kd-player-title">
                      <h2>{songTitle || '未命名作品'}</h2>
                      <p>AI 记忆歌曲 · 循环播放</p>
                    </div>

                    {/* progress */}
                    <div className="kd-progress-wrap">
                      <div className="kd-progress" onClick={handleSeek}>
                        <div className="kd-progress-fill" style={{ width: `${progress}%` }}>
                          <span className="kd-progress-knob" />
                        </div>
                      </div>
                      <div className="kd-time">
                        <span>{fmt(currentTime)}</span>
                        <span>{fmt(duration)}</span>
                      </div>
                    </div>

                    {/* controls */}
                    <div className="kd-controls">
                      <button className="kd-ctrl" onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10; }} aria-label="后退10秒">
                        <Icon.back10 />
                      </button>
                      <button
                        className="kd-ctrl-main"
                        onClick={() => { audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause(); }}
                        aria-label={isPlaying ? '暂停' : '播放'}
                      >
                        {isPlaying ? <Icon.pause size={30} /> : <span className="kd-play-shift"><Icon.play size={30} /></span>}
                      </button>
                      <button className="kd-ctrl" onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10; }} aria-label="前进10秒">
                        <Icon.fwd10 />
                      </button>
                    </div>

                    {/* live lyrics */}
                    <div className="kd-live-lyrics kd-scroll">
                      {lyricLines.map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={i} className="kd-live-gap" />;
                        if (isSectionLine(trimmed)) {
                          return <div key={i} className="kd-live-section">{stripSection(line)}</div>;
                        }
                        const active = i === activeLineIndex;
                        return (
                          <div
                            key={i}
                            ref={(el) => { lineRefs.current[i] = el; }}
                            className={`kd-live-line ${active ? 'is-active' : ''}`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>

                    {/* saved toast */}
                    <div className="kd-saved">
                      <span className="kd-saved-icon"><Icon.check size={18} /></span>
                      <div>
                        <strong>已保存到歌单</strong>
                        <em>随时回到「歌单」复习</em>
                      </div>
                    </div>
                  </div>

                  <audio ref={audioRef} src={audioUrl} autoPlay loop className="kd-audio" />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      </div>

      {/* ---------------------------------------------------------------- styles */}
      <style jsx global>{`
        .kd-app {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          background:
            radial-gradient(900px 480px at 50% -160px, rgba(59, 130, 246, 0.1), transparent 70%),
            var(--bg);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei',
            'Hiragino Sans GB', 'Inter', 'Segoe UI', sans-serif;
        }
        .kd-app *::selection { background: var(--primary-light); }

        /* ------------------------------------------------------------ header */
        .kd-sidebar {
          width: 260px; min-height: 100vh; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: var(--bg-card); border-right: 1px solid var(--border);
          padding: 24px 16px;
        }
        .kd-sidebar-header {
          display: flex; align-items: center; gap: 12px;
          padding: 0 8px 24px; border-bottom: 1px solid var(--border-light);
          margin-bottom: 24px;
        }
        .kd-brand-mark {
          width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 55%, #2563eb 100%);
          box-shadow: 0 8px 18px -6px rgba(59, 130, 246, 0.5);
        }
        .kd-brand-text { display: flex; flex-direction: column; line-height: 1.15; }
        .kd-brand-text strong { font-size: 16px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em; }
        .kd-brand-text em { font-size: 11px; font-weight: 600; color: var(--text-tertiary); font-style: normal; }
        .kd-sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .kd-sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border: none; cursor: pointer;
          background: transparent; border-radius: 12px;
          font-size: 14px; font-weight: 700; color: var(--text-tertiary);
          transition: all 0.2s ease;
        }
        .kd-sidebar-item:hover { background: var(--bg-hover); color: var(--text-secondary); }
        .kd-sidebar-item.is-active {
          background: var(--primary-light); color: var(--primary);
        }
        .kd-sidebar-user {
          padding: 16px 8px; border-top: 1px solid var(--border-light);
          display: flex; flex-direction: column; gap: 12px;
        }
        .kd-user-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-hover); color: var(--text-tertiary);
        }
        .kd-user-info { display: flex; flex-direction: column; gap: 2px; }
        .kd-user-name { display: flex; align-items: center; gap: 8px; }
        .kd-user-name strong { font-size: 14px; font-weight: 800; color: var(--text-primary); }
        .kd-user-badge {
          padding: 2px 8px; border-radius: 6px;
          background: linear-gradient(135deg, #60a5fa, var(--primary));
          color: #fff; font-size: 10px; font-weight: 800;
        }
        .kd-user-streak { font-size: 12px; color: var(--text-tertiary); font-weight: 600; }
        .kd-user-level {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; color: var(--text-tertiary);
        }
        .kd-level-bar {
          flex: 1; height: 6px; border-radius: 6px;
          background: var(--bg-hover); overflow: hidden;
        }
        .kd-level-bar > div { height: 100%; border-radius: 6px; background: var(--primary); }

        .kd-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* --------------------------------------------------------------- topbar */
        .kd-topbar {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px;
          background: var(--bg-card);
          backdrop-filter: saturate(180%) blur(16px);
          -webkit-backdrop-filter: saturate(180%) blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .kd-topbar-actions { display: flex; gap: 8px; }
        .kd-topbar-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border: 1px solid var(--border); cursor: pointer;
          background: var(--bg-card); border-radius: 12px;
          font-size: 13px; font-weight: 700; color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .kd-topbar-btn:hover { border-color: var(--primary); color: var(--primary); }
        .kd-topbar-btn-primary {
          background: linear-gradient(135deg, #60a5fa, var(--primary));
          color: #fff; border: none;
          box-shadow: 0 8px 18px -6px rgba(59, 130, 246, 0.6);
        }
        .kd-topbar-btn-primary:hover { filter: brightness(1.05); color: #fff; }

        /* -------------------------------------------------------------- main */
        .kd-main { flex: 1; width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 24px 96px; }
        .kd-stack { display: flex; flex-direction: column; gap: 36px; }
        .kd-fade { animation: kd-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes kd-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        .kd-section-head h2 { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
        .kd-section-head h3 { font-size: 18px; font-weight: 800; color: var(--text-primary); }
        .kd-section-head p { margin-top: 5px; font-size: 14px; color: var(--text-tertiary); }
        .kd-section-head { margin-bottom: 4px; }

        /* ---------------------------------------------------- card colors */
        .kd-card-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 12px;
        }
        .kd-card-color-0 .kd-card-icon { background: #dbeafe; }
        .kd-card-color-0 .kd-tag { background: #dbeafe; color: #1e40af; }
        .kd-card-color-1 .kd-card-icon { background: #ccfbf1; }
        .kd-card-color-1 .kd-tag { background: #ccfbf1; color: #0f766e; }
        .kd-card-color-2 .kd-card-icon { background: #ede9fe; }
        .kd-card-color-2 .kd-tag { background: #ede9fe; color: #6d28d9; }
        .kd-card-color-3 .kd-card-icon { background: #ffedd5; }
        .kd-card-color-3 .kd-tag { background: #ffedd5; color: #c2410c; }
        .kd-card-color-4 .kd-card-icon { background: #dbeafe; }
        .kd-card-color-4 .kd-tag { background: #dbeafe; color: #1e40af; }
        .kd-card-color-5 .kd-card-icon { background: #fce7f3; }
        .kd-card-color-5 .kd-tag { background: #fce7f3; color: #be185d; }

        .kd-card-arrow {
          position: absolute; bottom: 18px; right: 18px;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-hover); color: var(--text-tertiary);
          transition: all 0.2s ease;
        }
        .kd-card:hover .kd-card-arrow { background: var(--primary-light); color: var(--primary); }

        .kd-refresh-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 24px; border: 1px dashed var(--border); cursor: pointer;
          background: transparent; border-radius: 14px;
          font-size: 14px; font-weight: 700; color: var(--text-tertiary);
          transition: all 0.2s ease; margin-top: 8px;
        }
        .kd-refresh-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

        .kd-input-wrap { position: relative; }
        .kd-char-count {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 11px; font-weight: 700; color: var(--text-tertiary);
        }

        /* ---------------------------------------------------- step indicator */
        .kd-steps { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .kd-step { display: flex; align-items: center; gap: 12px; }
        .kd-step-dot {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-card); border: 1px solid var(--border);
          color: var(--text-tertiary);
          transition: all 0.3s ease;
        }
        .kd-step.is-active .kd-step-dot {
          background: linear-gradient(135deg, #60a5fa, var(--primary)); color: #fff; border-color: transparent;
          box-shadow: 0 8px 18px -6px rgba(59, 130, 246, 0.6);
        }
        .kd-step.is-done .kd-step-dot {
          background: var(--success); color: #fff; border-color: transparent;
          box-shadow: 0 8px 18px -6px rgba(16, 185, 129, 0.5);
        }
        .kd-step-label { font-size: 14px; font-weight: 700; color: var(--text-tertiary); transition: color 0.3s ease; }
        .kd-step.is-active .kd-step-label { color: var(--text-primary); }
        .kd-step-bar { width: 56px; height: 2px; border-radius: 2px; background: var(--border); overflow: hidden; }
        .kd-step-bar > span { display: block; height: 100%; width: 0; background: var(--primary); transition: width 0.6s ease; }
        .kd-step-bar.is-filled > span { width: 100%; }

        /* ------------------------------------------------------ select view */
        .kd-select { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
        .kd-select-main { display: flex; flex-direction: column; gap: 22px; }
        .kd-select-bar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; }

        .kd-search { position: relative; width: 300px; max-width: 100%; }
        .kd-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--text-tertiary); pointer-events: none; transition: color 0.2s ease; display: inline-flex;
        }
        .kd-search input {
          width: 100%; padding: 12px 38px 12px 42px;
          background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
          font-size: 14px; color: var(--text-primary); outline: none;
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .kd-search input::placeholder { color: var(--text-tertiary); }
        .kd-search input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
        .kd-search:focus-within .kd-search-icon { color: var(--primary); }
        .kd-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 22px; height: 22px; border-radius: 8px; border: none; cursor: pointer;
          background: var(--bg-hover); color: var(--text-tertiary); font-size: 16px; line-height: 1;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;
        }
        .kd-search-clear:hover { background: var(--border); color: var(--text-secondary); }

        .kd-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .kd-card {
          position: relative; text-align: left; cursor: pointer; overflow: hidden;
          padding: 22px; border-radius: 20px;
          background: var(--bg-card); border: 1.5px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.25s ease;
        }
        .kd-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 20px;
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.05), transparent 60%);
          opacity: 0; transition: opacity 0.25s ease; pointer-events: none;
        }
        .kd-card:hover { transform: translateY(-3px); border-color: var(--border); box-shadow: var(--shadow-lg); }
        .kd-card:hover::before { opacity: 1; }
        .kd-card.is-active {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-light), var(--shadow-lg);
          transform: translateY(-3px);
        }
        .kd-card-badge {
          position: absolute; top: 0; right: 0;
          width: 38px; height: 38px; border-bottom-left-radius: 16px;
          background: var(--primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .kd-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .kd-tag {
          padding: 4px 9px; border-radius: 7px;
          background: var(--bg-hover); color: var(--text-secondary);
          font-size: 11px; font-weight: 700;
        }
        .kd-tag-outline { background: var(--bg-card); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
        .kd-card-title { position: relative; font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; transition: color 0.2s ease; }
        .kd-card:hover .kd-card-title { color: var(--primary); }
        .kd-card-content {
          position: relative;
          font-size: 13px; line-height: 1.6; color: var(--text-tertiary);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .kd-card-cta {
          position: relative;
          display: inline-flex; align-items: center; gap: 5px; margin-top: 14px;
          font-size: 12px; font-weight: 800; color: var(--primary);
          opacity: 0; transform: translateX(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .kd-card-cta svg { transform: rotate(180deg); }
        .kd-card:hover .kd-card-cta, .kd-card.is-active .kd-card-cta { opacity: 1; transform: none; }

        .kd-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 72px 24px; text-align: center;
          background: var(--bg-card); border: 1.5px dashed var(--border); border-radius: 24px;
        }
        .kd-empty-icon {
          width: 60px; height: 60px; border-radius: 50%; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-hover); color: var(--text-tertiary);
        }
        .kd-empty-title { font-size: 16px; font-weight: 800; color: var(--text-primary); }
        .kd-empty-sub { font-size: 13px; color: var(--text-tertiary); margin-top: 6px; }

        /* --------------------------------------------------- compose panel */
        .kd-panel-wrap { position: sticky; top: 92px; }
        .kd-panel {
          position: relative;
          display: flex; flex-direction: column; gap: 18px;
          padding: 26px; border-radius: 26px;
          background: var(--bg-card); border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .kd-panel::after {
          content: ''; position: absolute; inset: 0; border-radius: 26px; pointer-events: none;
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.05), transparent 30%);
        }
        .kd-field { position: relative; display: flex; flex-direction: column; gap: 8px; }
        .kd-label { font-size: 12px; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.01em; }
        .kd-input {
          width: 100%; padding: 13px 16px;
          background: var(--bg); border: 1px solid var(--border); border-radius: 14px;
          font-size: 14px; font-weight: 600; color: var(--text-primary); outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .kd-input::placeholder { color: var(--text-tertiary); font-weight: 500; }
        .kd-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
        .kd-textarea {
          width: 100%; height: 184px; resize: none; padding: 16px;
          background: var(--bg); border: 1px solid var(--border); border-radius: 16px;
          font-size: 14px; line-height: 1.7; color: var(--text-primary); outline: none;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .kd-textarea::placeholder { color: var(--text-tertiary); }
        .kd-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
        .kd-textarea.is-over { border-color: var(--danger); box-shadow: 0 0 0 4px var(--danger-light); }
        .kd-field-meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--text-tertiary); padding: 0 2px; }
        .kd-field-meta .is-warn { color: var(--danger); }

        .kd-error {
          position: relative;
          display: flex; align-items: center; gap: 10px;
          padding: 13px 15px; border-radius: 14px;
          background: var(--danger-light); color: var(--danger);
          font-size: 13px; font-weight: 700;
          animation: kd-shake 0.4s ease;
        }
        @keyframes kd-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

        .kd-hint {
          position: relative;
          display: flex; gap: 11px; padding: 14px 15px; border-radius: 16px;
          background: var(--primary-light);
        }
        .kd-hint-icon { color: var(--primary); flex-shrink: 0; margin-top: 1px; }
        .kd-hint p { font-size: 12px; line-height: 1.65; color: var(--primary-hover); font-weight: 600; }

        /* ------------------------------------------------------ primary btn */
        .kd-btn {
          position: relative; overflow: hidden;
          width: 100%; padding: 16px; border: none; cursor: pointer;
          border-radius: 16px; color: #fff;
          font-size: 15px; font-weight: 800; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: transform 0.12s ease, box-shadow 0.25s ease, filter 0.2s ease;
        }
        .kd-btn-primary { background: linear-gradient(135deg, #60a5fa 0%, var(--primary) 55%, var(--primary-hover) 100%); box-shadow: 0 12px 24px -10px rgba(59, 130, 246, 0.7); }
        .kd-btn-primary:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 16px 30px -10px rgba(59, 130, 246, 0.78); }
        .kd-btn-success { background: linear-gradient(135deg, #34d399 0%, var(--success) 60%, #059669 100%); box-shadow: 0 12px 24px -10px rgba(16, 185, 129, 0.65); }
        .kd-btn-success:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 16px 30px -10px rgba(16, 185, 129, 0.72); }
        .kd-btn:active:not(:disabled) { transform: scale(0.975); }
        .kd-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        /* ------------------------------------------------------ centered cols */
        .kd-center { max-width: 760px; margin: 0 auto; }
        .kd-center-sm { max-width: 480px; margin: 0 auto; }

        .kd-back {
          display: inline-flex; align-items: center; gap: 9px; margin-bottom: 20px;
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: var(--text-tertiary);
          transition: color 0.2s ease;
        }
        .kd-back:hover { color: var(--primary); }
        .kd-back-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-card); border: 1px solid var(--border); box-shadow: var(--shadow-sm);
          transition: border-color 0.2s ease;
        }
        .kd-back:hover .kd-back-circle { border-color: var(--primary); }

        /* ----------------------------------------------------------- sheet */
        .kd-sheet {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 30px; overflow: hidden; box-shadow: var(--shadow-lg);
        }
        .kd-sheet-head {
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
          padding: 28px 32px; border-bottom: 1px solid var(--border-light);
          background: linear-gradient(180deg, var(--bg-active), var(--bg));
        }
        .kd-sheet-id { display: flex; align-items: center; gap: 16px; }
        .kd-sheet-mark {
          width: 56px; height: 56px; border-radius: 18px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #60a5fa, var(--primary) 55%, var(--primary-hover)); color: #fff;
          box-shadow: 0 10px 22px -8px rgba(59, 130, 246, 0.6);
        }
        .kd-sheet-id h2 { font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .kd-sheet-id p { font-size: 13px; color: var(--text-tertiary); margin-top: 3px; font-weight: 600; }
        .kd-sheet-body { padding: 32px; }

        .kd-lyrics-box {
          padding: 30px; margin-bottom: 26px; max-height: 460px; overflow-y: auto;
          background: var(--bg); border: 1px solid var(--border-light); border-radius: 22px;
        }
        .kd-lyric-section {
          font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--primary); margin: 22px 0 12px;
        }
        .kd-lyric-section:first-child { margin-top: 0; }
        .kd-lyric-line { font-size: 18px; font-weight: 700; line-height: 2; color: var(--text-secondary); }
        .kd-lyric-gap { height: 12px; }
        .kd-eta { text-align: center; font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-top: 18px; }

        /* ---------------------------------------------------------- player */
        .kd-player {
          position: relative;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 32px; overflow: hidden; box-shadow: var(--shadow-lg);
        }
        .kd-cover {
          position: relative; height: 240px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(120% 120% at 50% 0%, #1e3a8a 0%, #0f172a 55%, #020617 100%);
        }
        .kd-cover-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(59, 130, 246, 0.55), transparent 60%);
        }
        .kd-cover-disc {
          position: relative; z-index: 2;
          width: 128px; height: 128px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          transition: transform 0.7s ease, box-shadow 0.7s ease;
        }
        .kd-cover-disc.is-playing {
          transform: scale(1.08);
          box-shadow: 0 0 56px rgba(59, 130, 246, 0.55);
          animation: kd-spin-slow 8s linear infinite;
        }
        @keyframes kd-spin-slow { to { transform: scale(1.08) rotate(360deg); } }
        .kd-cover-ring {
          position: absolute; inset: -14px; border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.4);
          animation: kd-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes kd-ping { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
        .kd-eq {
          position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
          z-index: 2; display: flex; align-items: flex-end; gap: 5px; height: 30px;
        }
        .kd-eq > span {
          width: 4px; border-radius: 4px; background: var(--primary);
          transition: height 0.3s ease;
          animation: kd-wave 0.9s ease-in-out infinite;
        }
        @keyframes kd-wave { 0%,100%{transform:scaleY(0.6)} 50%{transform:scaleY(1.4)} }

        .kd-player-body { padding: 30px; display: flex; flex-direction: column; gap: 26px; }
        .kd-player-title { text-align: center; }
        .kd-player-title h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); }
        .kd-player-title p { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--text-tertiary); margin-top: 7px; }

        .kd-progress-wrap { display: flex; flex-direction: column; gap: 9px; }
        .kd-progress { height: 8px; border-radius: 8px; background: var(--bg-hover); cursor: pointer; }
        .kd-progress:hover { background: var(--border); }
        .kd-progress-fill {
          position: relative; height: 100%; border-radius: 8px;
          background: linear-gradient(90deg, #60a5fa, var(--primary)); transition: width 0.1s linear;
        }
        .kd-progress-knob {
          position: absolute; right: -7px; top: 50%; transform: translateY(-50%) scale(0);
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--bg-card); border: 3px solid var(--primary); box-shadow: var(--shadow-md);
          transition: transform 0.15s ease;
        }
        .kd-progress:hover .kd-progress-knob { transform: translateY(-50%) scale(1); }
        .kd-time { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--text-tertiary); font-variant-numeric: tabular-nums; }

        .kd-controls { display: flex; align-items: center; justify-content: center; gap: 28px; }
        .kd-ctrl {
          width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-hover); color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .kd-ctrl:hover { background: var(--primary-light); color: var(--primary); }
        .kd-ctrl:active { transform: scale(0.9); }
        .kd-ctrl-main {
          width: 74px; height: 74px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #60a5fa, var(--primary) 55%, var(--primary-hover)); color: #fff;
          box-shadow: 0 14px 28px -10px rgba(59, 130, 246, 0.7);
          transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .kd-ctrl-main:hover { transform: scale(1.06); filter: brightness(1.05); }
        .kd-ctrl-main:active { transform: scale(0.94); }
        .kd-play-shift { margin-left: 4px; display: inline-flex; }

        .kd-live-lyrics {
          padding: 22px; height: 178px; overflow-y: auto; scroll-behavior: smooth;
          background: var(--bg); border: 1px solid var(--border-light); border-radius: 20px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .kd-live-section { font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-tertiary); padding-top: 6px; }
        .kd-live-line {
          font-size: 15px; font-weight: 700; color: var(--text-tertiary); opacity: 0.55;
          transform-origin: left center;
          transition: color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
        }
        .kd-live-line.is-active { color: var(--primary); opacity: 1; transform: scale(1.05); }
        .kd-live-gap { height: 4px; }

        .kd-saved {
          display: flex; align-items: center; gap: 13px;
          padding: 14px 16px; border-radius: 18px;
          background: var(--success-light);
          animation: kd-fade-up 0.5s 0.3s both;
        }
        .kd-saved-icon {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--success); color: #fff;
          box-shadow: 0 8px 16px -6px rgba(16, 185, 129, 0.5);
        }
        .kd-saved strong { display: block; font-size: 13px; font-weight: 800; color: #065f46; }
        .kd-saved em { font-size: 11px; font-weight: 600; font-style: normal; color: #047857; }
        .kd-audio { display: none; }

        /* ------------------------------------------------------ settings fab */
        .kd-fab {
          width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          background: var(--bg-card); color: var(--text-tertiary);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        .kd-fab:hover { background: var(--bg-hover); color: var(--primary); }
        .kd-fab:active { transform: scale(0.95); }
        .kd-fab-panel {
          position: fixed; bottom: 80px; left: 28px; z-index: 100; width: 224px;
          padding: 22px; border-radius: 24px;
          background: var(--bg-card); border: 1px solid var(--border); box-shadow: var(--shadow-lg);
          animation: kd-fade-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column; gap: 20px;
        }
        .kd-fab-label { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 10px; }
        .kd-seg { display: flex; gap: 4px; padding: 4px; background: var(--bg); border-radius: 12px; }
        .kd-seg button {
          flex: 1; padding: 8px; border: none; cursor: pointer; border-radius: 9px;
          font-size: 13px; font-weight: 700; color: var(--text-tertiary); background: transparent;
          transition: all 0.2s ease;
        }
        .kd-seg button.is-active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-sm); }
        .kd-overlay { position: fixed; inset: 0; z-index: 90; background: rgba(15, 23, 42, 0.12); backdrop-filter: blur(2px); }

        /* ----------------------------------------------------------- scroll */
        .kd-scroll::-webkit-scrollbar { width: 5px; }
        .kd-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 5px; }
        .kd-scroll::-webkit-scrollbar-track { background: transparent; }
        .kd-spin { animation: kd-rotate 0.8s linear infinite; }
        @keyframes kd-rotate { to { transform: rotate(360deg); } }

        /* ------------------------------------------------------- responsive */
        @media (max-width: 920px) {
          .kd-sidebar { width: 220px; }
          .kd-select { grid-template-columns: 1fr; }
          .kd-panel-wrap { position: static; }
        }
        @media (max-width: 640px) {
          .kd-sidebar { display: none; }
          .kd-main { padding: 28px 16px 88px; }
          .kd-grid { grid-template-columns: 1fr; }
          .kd-search { width: 100%; }
          .kd-step-label { display: none; }
          .kd-step-bar { width: 32px; }
          .kd-sheet-head, .kd-sheet-body { padding: 22px; }
          .kd-section-head h2 { font-size: 21px; }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------- */
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { label: '选内容', icon: <Icon.search size={15} /> },
    { label: '看歌词', icon: <Icon.note size={15} /> },
    { label: '听记忆', icon: <Icon.play size={15} /> },
  ];
  return (
    <div className="kd-steps">
      {steps.map((s, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div key={s.label} className="kd-step-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`kd-step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>
              <span className="kd-step-dot">{done ? <Icon.check size={16} /> : s.icon}</span>
              <span className="kd-step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className={`kd-step-bar ${i < current ? 'is-filled' : ''}`}><span /></span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="kd-back" onClick={onClick}>
      <span className="kd-back-circle"><Icon.arrowLeft size={15} /></span>
      {children}
    </button>
  );
}

function PrimaryButton({
  onClick, disabled, loading, tone, icon, loadingText, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone: 'primary' | 'success';
  icon?: React.ReactNode;
  loadingText?: string;
  children: React.ReactNode;
}) {
  return (
    <button className={`kd-btn kd-btn-${tone}`} onClick={onClick} disabled={disabled}>
      {loading ? (
        <>
          <Icon.spinner size={18} />
          {loadingText || '处理中…'}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

function SettingsButton() {
  const { theme, setTheme } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="kd-fab" onClick={() => setOpen(!open)} aria-label="设置">
        <Icon.settings size={20} />
      </button>

      {open && (
        <>
          <div className="kd-overlay" onClick={() => setOpen(false)} />
          <div className="kd-fab-panel">
            <div>
              <p className="kd-fab-label">主题</p>
              <div className="kd-seg">
                {(['light', 'dark'] as const).map((k) => (
                  <button key={k} className={theme === k ? 'is-active' : ''} onClick={() => setTheme(k)}>
                    {k === 'light' ? '亮色' : '暗色'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
