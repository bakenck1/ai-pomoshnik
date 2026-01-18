/**
 * Help page with simple instructions for elderly users.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, fontSizeScales } from '@/lib/store';

export default function HelpPage() {
  const router = useRouter();
  const { language, isAuthenticated, logout, theme, fontSize } = useAppStore();
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

  if (!isAuthenticated) return null;

  const steps = language === 'ru' ? [
    { icon: '👆', title: 'Шаг 1: Нажмите кнопку', description: 'Нажмите на большую кнопку с микрофоном в центре экрана' },
    { icon: '🎤', title: 'Шаг 2: Говорите', description: 'Говорите громко и чётко в микрофон вашего устройства' },
    { icon: '⏹️', title: 'Шаг 3: Остановите запись', description: 'Нажмите кнопку ещё раз, чтобы остановить запись' },
    { icon: '✅', title: 'Шаг 4: Подтвердите', description: 'Проверьте текст и нажмите "Да" если всё правильно' },
    { icon: '🔊', title: 'Шаг 5: Получите ответ', description: 'Помощник ответит вам голосом' },
  ] : [
    { icon: '👆', title: '1-қадам: Түймені басыңыз', description: 'Экранның ортасындағы үлкен түймені басыңыз' },
    { icon: '🎤', title: '2-қадам: Сөйлеңіз', description: 'Құрылғыңыздың микрофонына қатты және анық сөйлеңіз' },
    { icon: '⏹️', title: '3-қадам: Жазуды тоқтатыңыз', description: 'Жазуды тоқтату үшін түймені қайта басыңыз' },
    { icon: '✅', title: '4-қадам: Растаңыз', description: 'Мәтінді тексеріп, дұрыс болса "Иә" басыңыз' },
    { icon: '🔊', title: '5-қадам: Жауап алыңыз', description: 'Көмекші сізге дауыспен жауап береді' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e9f0] via-[#eef1f5] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden font-sans" style={{ fontSize: `${scale}rem` }}>
      {/* Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-200/40 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-100/50 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />

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
            <span className="text-xl font-bold">{language === 'ru' ? 'Назад' : 'Артқа'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="glass-panel px-4 py-3 rounded-full text-red-600 dark:text-red-400 font-bold text-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">{language === 'ru' ? 'Выйти' : 'Шығу'}</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center px-4 w-full max-w-2xl mx-auto py-8">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-gray-800 dark:text-white text-3xl md:text-4xl font-bold mb-4 text-center">
            {language === 'ru' ? 'Как пользоваться' : 'Қалай пайдалану керек'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xl text-center mb-12">
            {language === 'ru' ? 'Простая инструкция' : 'Қарапайым нұсқаулық'}
          </p>

          <div className="w-full space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="glass-panel rounded-2xl p-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/50 dark:bg-gray-700/50 flex items-center justify-center text-3xl shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-white text-xl font-bold mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="w-full mt-12">
            <h2 className="text-gray-800 dark:text-white text-2xl font-bold mb-6 text-center">
              {language === 'ru' ? 'Частые вопросы' : 'Жиі қойылатын сұрақтар'}
            </h2>

            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-gray-800 dark:text-white text-lg font-bold mb-2">
                  {language === 'ru' ? '❓ Не работает микрофон?' : '❓ Микрофон жұмыс істемей ме?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'ru' 
                    ? 'Разрешите доступ к микрофону в браузере. Обновите страницу и попробуйте снова.'
                    : 'Браузерде микрофонға рұқсат беріңіз. Бетті жаңартып, қайталап көріңіз.'
                  }
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-gray-800 dark:text-white text-lg font-bold mb-2">
                  {language === 'ru' ? '🔇 Не слышно ответ?' : '🔇 Жауап естілмей ме?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === 'ru' 
                    ? 'Проверьте громкость на вашем устройстве. Убедитесь, что звук не выключен.'
                    : 'Құрылғыңыздағы дыбыс деңгейін тексеріңіз. Дыбыс өшірілмегеніне көз жеткізіңіз.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            className="mt-12 w-full h-16 rounded-full bg-green-500 text-white text-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {language === 'ru' ? 'Начать говорить' : 'Сөйлеуді бастау'}
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
