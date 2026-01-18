/**
 * Main User Interface - Voice Assistant for Elderly Users.
 * Clean, minimal design with large touch targets.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { voiceApi, TranscribeResponse, RespondResponse } from '@/services/api';
import { useAppStore, fontSizeScales } from '@/lib/store';

type AppState = 'idle' | 'recording' | 'processing' | 'confirming' | 'responding' | 'playing' | 'error';

export default function Home() {
  const router = useRouter();
  const { language, setLanguage, sessionId, setSessionId, addToHistory, isAuthenticated, user, logout, theme, toggleTheme, fontSize } = useAppStore();
  
  const [state, setState] = useState<AppState>('idle');
  const [transcription, setTranscription] = useState<TranscribeResponse | null>(null);
  const [response, setResponse] = useState<RespondResponse | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const scale = fontSizeScales[fontSize];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      setCurrentTime(`${time} • ${date}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize session
  const initSession = useCallback(async () => {
    if (!sessionId) {
      try {
        const { session_id } = await voiceApi.createSession({ language });
        setSessionId(session_id);
        return session_id;
      } catch {
        setState('error');
        return null;
      }
    }
    return sessionId;
  }, [sessionId, setSessionId, language]);

  // Handle microphone button click
  const handleMicClick = useCallback(async () => {
    if (state === 'processing' || state === 'responding') return;

    if (isRecording) {
      setState('processing');
      try {
        const audioBlob = await stopRecording();
        const currentSessionId = await initSession();
        if (!currentSessionId) return;

        const result = await voiceApi.uploadAudio(currentSessionId, audioBlob);
        setTranscription(result);
        setState('confirming');
      } catch {
        setState('error');
      }
    } else {
      try {
        await startRecording();
        setState('recording');
      } catch {
        setState('error');
      }
    }
  }, [state, isRecording, startRecording, stopRecording, initSession]);

  // Confirm and get response
  const handleConfirm = useCallback(async () => {
    if (!sessionId || !transcription) return;
    setState('responding');

    try {
      await voiceApi.confirmTranscript(sessionId, transcription.turn_id, true);
      
      const assistantText = language === 'ru'
        ? `Я понял вас: "${transcription.normalized_transcript}". Чем могу помочь?`
        : `Мен сізді түсіндім: "${transcription.normalized_transcript}". Қалай көмектесе аламын?`;

      const result = await voiceApi.generateResponse(sessionId, transcription.turn_id, assistantText);
      setResponse(result);
      setState('playing');

      addToHistory({
        transcript: transcription.normalized_transcript,
        response: result.assistant_text,
        audioUrl: result.audio_url,
        language,
      });

      const audio = new Audio(`http://localhost:8000${result.audio_url}`);
      audio.play().catch(console.error);
      audio.onended = () => setState('idle');
    } catch {
      setState('error');
    }
  }, [sessionId, transcription, language, addToHistory]);

  const handleReset = useCallback(() => {
    setTranscription(null);
    setResponse(null);
    setState('idle');
  }, []);

  const toggleLanguage = () => setLanguage(language === 'ru' ? 'kk' : 'ru');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e9f0] via-[#eef1f5] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden font-sans" style={{ fontSize: `${scale}rem` }}>
      {/* Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-100/50 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />
      <div className="fixed top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-100/40 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full px-6 py-6 md:px-12 flex items-center justify-between">
          <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <h2 className="text-gray-800 dark:text-white text-xl font-bold">
              {language === 'ru' ? 'Голосовой помощник' : 'Дауыстық көмекші'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="glass-panel w-12 h-12 rounded-full flex items-center justify-center text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all"
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="glass-panel px-4 py-3 rounded-full text-gray-800 dark:text-white font-bold text-lg hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all"
            >
              {language === 'ru' ? '🇰🇿 KZ' : '🇷🇺 RU'}
            </button>

            {/* Time */}
            <div className="glass-panel px-6 py-3 rounded-full text-gray-800 dark:text-white font-bold text-lg hidden sm:flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{currentTime}</span>
            </div>

            {/* Logout */}
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
        <main className="flex-grow flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto py-8">
          
          {/* Status Chip */}
          <div className="mb-10">
            <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${
                state === 'recording' ? 'bg-red-500 animate-pulse' :
                state === 'processing' || state === 'responding' ? 'bg-yellow-500 animate-pulse' :
                state === 'error' ? 'bg-red-500' :
                'bg-green-500 animate-pulse'
              }`} />
              <span className="text-gray-800 dark:text-white text-lg font-medium">
                {state === 'idle' && (language === 'ru' ? 'Готов к работе' : 'Жұмысқа дайын')}
                {state === 'recording' && (language === 'ru' ? 'Запись...' : 'Жазу...')}
                {state === 'processing' && (language === 'ru' ? 'Обработка...' : 'Өңдеу...')}
                {state === 'confirming' && (language === 'ru' ? 'Проверьте текст' : 'Мәтінді тексеріңіз')}
                {state === 'responding' && (language === 'ru' ? 'Генерация ответа...' : 'Жауап жасау...')}
                {state === 'playing' && (language === 'ru' ? 'Воспроизведение' : 'Ойнату')}
                {state === 'error' && (language === 'ru' ? 'Ошибка' : 'Қате')}
              </span>
            </div>
          </div>

          {/* Idle / Recording State - Main Button */}
          {(state === 'idle' || state === 'recording' || state === 'processing') && (
            <>
              <div className="relative flex items-center justify-center group cursor-pointer mb-12">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 w-full h-full transform scale-125 transition-colors ${
                  state === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'
                }`} />
                
                <button
                  onClick={handleMicClick}
                  disabled={state === 'processing'}
                  className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-300 
                    ${state === 'processing' ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
                    bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-4 shadow-xl
                    ${state === 'recording' ? 'border-red-300' : 'border-white/50 dark:border-gray-600/50 hover:border-green-300'}
                  `}
                >
                  {state === 'processing' ? (
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg 
                      className={`w-20 h-20 md:w-24 md:h-24 transition-colors ${
                        state === 'recording' ? 'text-red-500' : 'text-green-600'
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {state === 'recording' ? (
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      ) : (
                        <>
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </>
                      )}
                    </svg>
                  )}
                </button>
              </div>

              <h1 className="text-gray-800 dark:text-white text-3xl md:text-[40px] font-bold leading-tight text-center max-w-2xl mb-6 px-4">
                {state === 'recording' 
                  ? (language === 'ru' ? 'Говорите...' : 'Сөйлеңіз...')
                  : (language === 'ru' ? 'Я вас слушаю' : 'Мен сізді тыңдаймын')
                }
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xl text-center max-w-lg mb-12">
                {state === 'recording'
                  ? (language === 'ru' ? 'Нажмите ещё раз, чтобы остановить' : 'Тоқтату үшін қайта басыңыз')
                  : (language === 'ru' ? 'Нажмите на микрофон и говорите' : 'Микрофонды басып, сөйлеңіз')
                }
              </p>
            </>
          )}

          {/* Confirming State */}
          {state === 'confirming' && transcription && (
            <div className="w-full max-w-2xl">
              <div className="glass-panel rounded-3xl p-8 mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  {language === 'ru' ? 'Вы сказали:' : 'Сіз айттыңыз:'}
                </p>
                <p className="text-gray-800 dark:text-white text-2xl md:text-3xl font-semibold leading-relaxed">
                  "{transcription.normalized_transcript}"
                </p>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-xl text-center mb-6">
                {language === 'ru' ? 'Всё правильно?' : 'Бәрі дұрыс па?'}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleConfirm}
                  className="glass-panel h-20 rounded-full flex items-center justify-center gap-3 text-white bg-green-500 hover:bg-green-600 transition-all text-xl font-bold shadow-lg"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'ru' ? 'Да' : 'Иә'}
                </button>
                <button
                  onClick={handleReset}
                  className="glass-panel h-20 rounded-full flex items-center justify-center gap-3 text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all text-xl font-bold"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {language === 'ru' ? 'Повторить' : 'Қайталау'}
                </button>
              </div>
            </div>
          )}

          {/* Responding State */}
          {state === 'responding' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-800 dark:text-white text-2xl font-semibold">
                {language === 'ru' ? 'Генерирую ответ...' : 'Жауап жасаудамын...'}
              </p>
            </div>
          )}

          {/* Playing State */}
          {state === 'playing' && response && (
            <div className="w-full max-w-2xl">
              <div className="glass-panel rounded-3xl p-8 mb-6">
                <div className="flex items-center gap-3 text-green-600 mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <span className="text-xl font-semibold">
                    {language === 'ru' ? 'Ответ:' : 'Жауап:'}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-white text-2xl font-medium leading-relaxed">
                  {response.assistant_text}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full glass-panel h-20 rounded-full flex items-center justify-center gap-3 text-white bg-green-500 hover:bg-green-600 transition-all text-xl font-bold shadow-lg"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                {language === 'ru' ? 'Новый вопрос' : 'Жаңа сұрақ'}
              </button>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="w-full max-w-lg">
              <div className="glass-panel rounded-3xl p-8 text-center border-2 border-red-200 dark:border-red-800">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-gray-800 dark:text-white text-2xl font-bold mb-2">
                  {language === 'ru' ? 'Что-то пошло не так' : 'Бірдеңе дұрыс болмады'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                  {language === 'ru' ? 'Попробуйте ещё раз' : 'Қайталап көріңіз'}
                </p>
                <button
                  onClick={handleReset}
                  className="w-full h-16 rounded-full bg-green-500 text-white text-xl font-bold hover:bg-green-600 transition-all"
                >
                  {language === 'ru' ? 'Попробовать снова' : 'Қайталап көру'}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          {state === 'idle' && (
            <div className="w-full max-w-3xl mt-8">
              <div className="grid grid-cols-3 gap-4 md:gap-6 px-4">
                <button 
                  onClick={() => router.push('/history')}
                  className="glass-panel h-16 md:h-20 rounded-full flex items-center justify-center gap-3 text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg md:text-xl font-bold">
                    {language === 'ru' ? 'История' : 'Тарих'}
                  </span>
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="glass-panel h-16 md:h-20 rounded-full flex items-center justify-center gap-3 text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-lg md:text-xl font-bold">
                    {language === 'ru' ? 'Настройки' : 'Баптаулар'}
                  </span>
                </button>
                <button 
                  onClick={() => router.push('/help')}
                  className="glass-panel h-16 md:h-20 rounded-full flex items-center justify-center gap-3 text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/30 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg md:text-xl font-bold">
                    {language === 'ru' ? 'Помощь' : 'Көмек'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          <p>Version 1.0 • {user?.name}</p>
        </footer>
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
