'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';

export default function SettingsPanel() {
  const { theme, setTheme } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg transition-colors" aria-label="设置">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-gray-900 h-full shadow-xl p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-6">设置</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((opt) => (
                  <button key={opt} onClick={() => setTheme(opt)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${theme === opt ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {opt === 'light' ? '亮色' : '暗色'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
