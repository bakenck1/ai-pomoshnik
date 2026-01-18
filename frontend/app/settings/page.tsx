/**
 * Settings page for elderly users.
 * Simple controls for language, theme, and font size.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, fontSizeScales } from '@/lib/store';

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, fontSize, setFontSize, theme, toggleTheme, isAuthenticated, logout, user } = useAppStore();
  const scale = fontSizeScales[fontSize];
  const isAdmin = user?.role === 'admin';

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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e9f0] via-[#eef1f5] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden font-sans" style={{ fontSize: `${scale}rem` }}>
      {/* Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-100/50 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />

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

          <button
            onClick={handleLogout}
            className="glass-panel px-4 py-3 rounded-full text-red-600 dark:text-red-400 font-bold text-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{language === 'ru' ? 'Выйти' : 'Шығу'}</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center px-4 w-full max-w-2xl mx-auto py-8">
          <h1 className="text-gray-800 dark:text-white text-3xl md:text-4xl font-bold mb-12">
            {language === 'ru' ? 'Настройки' : 'Баптаулар'}
          </h1>

          <div className="w-full space-y-8">
            {/* Theme */}
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="text-gray-800 dark:text-white text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
                {language === 'ru' ? 'Тема' : 'Тақырып'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  className={`h-20 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  ☀️ {language === 'ru' ? 'Светлая' : 'Жарық'}
                </button>
                <button
                  onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  className={`h-20 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  🌙 {language === 'ru' ? 'Тёмная' : 'Қараңғы'}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="text-gray-800 dark:text-white text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                {language === 'ru' ? 'Язык' : 'Тіл'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage('ru')}
                  className={`h-20 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all ${
                    language === 'ru'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  🇷🇺 Русский
                </button>
                <button
                  onClick={() => setLanguage('kk')}
                  className={`h-20 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all ${
                    language === 'kk'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  🇰🇿 Қазақша
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="text-gray-800 dark:text-white text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                {language === 'ru' ? 'Размер текста' : 'Мәтін өлшемі'}
              </h2>
              
              {/* Preview */}
              <div className="mb-4 p-4 rounded-2xl bg-white/50 dark:bg-gray-700/50">
                <p className="text-gray-800 dark:text-white" style={{ fontSize: `${scale * 1.2}rem` }}>
                  {language === 'ru' ? 'Пример текста' : 'Мәтін үлгісі'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    fontSize === 'normal'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  <span style={{ fontSize: '1rem' }}>A</span>
                  <span className="text-sm font-medium">
                    {language === 'ru' ? 'Обычный' : 'Қалыпты'}
                  </span>
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    fontSize === 'large'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  <span style={{ fontSize: '1.25rem' }}>A</span>
                  <span className="text-sm font-medium">
                    {language === 'ru' ? 'Крупный' : 'Үлкен'}
                  </span>
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                    fontSize === 'xlarge'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50'
                  }`}
                >
                  <span style={{ fontSize: '1.5rem' }}>A</span>
                  <span className="text-sm font-medium">
                    {language === 'ru' ? 'Очень крупный' : 'Өте үлкен'}
                  </span>
                </button>
              </div>
            </div>

            {/* Admin Panel Link - Only for admins */}
            {isAdmin && (
              <div className="glass-panel rounded-3xl p-6">
                <h2 className="text-gray-800 dark:text-white text-xl font-bold mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  {language === 'ru' ? 'Для исследователей' : 'Зерттеушілер үшін'}
                </h2>
                <button
                  onClick={() => router.push('/research')}
                  className="w-full h-16 rounded-2xl bg-indigo-500 text-white text-xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {language === 'ru' ? 'Открыть панель исследований' : 'Зерттеу панелін ашу'}
                </button>
              </div>
            )}
          </div>
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
