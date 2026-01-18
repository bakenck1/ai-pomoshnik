/**
 * History page showing past conversations.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, fontSizeScales } from '@/lib/store';

export default function HistoryPage() {
  const router = useRouter();
  const { language, history, clearHistory, isAuthenticated, logout, theme, fontSize } = useAppStore();
  const scale = fontSizeScales[fontSize];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'kk-KZ', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e9f0] via-[#eef1f5] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden font-sans" style={{ fontSize: `${scale}rem` }}>
      {/* Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-6 md:px-12 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xl font-bold">
              {language === 'ru' ? 'Назад' : 'Артқа'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="glass-panel px-6 py-3 rounded-full flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-lg font-bold">
                  {language === 'ru' ? 'Очистить' : 'Тазалау'}
                </span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="glass-panel px-4 py-3 rounded-full text-red-600 dark:text-red-400 font-bold text-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">{language === 'ru' ? 'Выйти' : 'Шығу'}</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center px-4 w-full max-w-2xl mx-auto py-8">
          <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-gray-800 dark:text-white text-3xl md:text-4xl font-bold mb-12 text-center">
            {language === 'ru' ? 'История' : 'Тарих'}
          </h1>

          {history.length === 0 ? (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xl">
                {language === 'ru' ? 'Пока нет записей' : 'Әзірге жазбалар жоқ'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-lg mt-2">
                {language === 'ru' ? 'Начните разговор с помощником' : 'Көмекшімен сөйлесуді бастаңыз'}
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {history.map((item) => (
                <div key={item.id} className="glass-panel rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      {formatDate(item.timestamp)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {item.language === 'ru' ? '🇷🇺 RU' : '🇰🇿 KZ'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                      {language === 'ru' ? 'Вы сказали:' : 'Сіз айттыңыз:'}
                    </p>
                    <p className="text-gray-800 dark:text-white text-lg font-medium">
                      "{item.transcript}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                      {language === 'ru' ? 'Ответ:' : 'Жауап:'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {item.response}
                    </p>
                  </div>

                  {item.audioUrl && (
                    <button
                      onClick={() => {
                        const audio = new Audio(`http://localhost:8000${item.audioUrl}`);
                        audio.play().catch(console.error);
                      }}
                      className="mt-4 w-full h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium hover:bg-green-200 dark:hover:bg-green-800/30 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      {language === 'ru' ? 'Прослушать' : 'Тыңдау'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            className="mt-12 w-full h-16 rounded-full bg-green-500 text-white text-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {language === 'ru' ? 'Новый вопрос' : 'Жаңа сұрақ'}
          </button>
        </main>
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        :global(.dark) .glass-panel {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
