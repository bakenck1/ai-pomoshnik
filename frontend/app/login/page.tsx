/**
 * Login/Register page for Voice Assistant.
 * Simple, accessible design for elderly users.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { login, language } = useAppStore();
  
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { username, password }
        : { name, username, password };

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Ошибка');
      }

      if (mode === 'register') {
        // After registration, login
        const loginRes = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        
        if (!loginRes.ok) throw new Error('Ошибка входа');
        const loginData = await loginRes.json();
        
        // Get user info
        const meRes = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${loginData.access_token}` },
        });
        const userData = await meRes.json();
        
        login({
          id: userData.id,
          name: userData.name,
          email: userData.username,
          role: userData.role,
        }, loginData.access_token);
      } else {
        const data = await res.json();
        
        // Get user info
        const meRes = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${data.access_token}` },
        });
        const userData = await meRes.json();
        
        login({
          id: userData.id,
          name: userData.name,
          email: userData.username,
          role: userData.role,
        }, data.access_token);
      }

      // Redirect based on role
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    ru: {
      title: 'Голосовой помощник',
      subtitle: 'Для пожилых людей',
      login: 'Вход',
      register: 'Регистрация',
      name: 'ФИО (Имя)',
      username: 'Логин',
      password: 'Пароль',
      submit: mode === 'login' ? 'Войти' : 'Зарегистрироваться',
      switchToRegister: 'Нет аккаунта? Зарегистрируйтесь',
      switchToLogin: 'Уже есть аккаунт? Войдите',
    },
    kk: {
      title: 'Дауыстық көмекші',
      subtitle: 'Қарт адамдар үшін',
      login: 'Кіру',
      register: 'Тіркелу',
      name: 'Аты-жөні',
      username: 'Логин',
      password: 'Құпия сөз',
      submit: mode === 'login' ? 'Кіру' : 'Тіркелу',
      switchToRegister: 'Аккаунт жоқ па? Тіркеліңіз',
      switchToLogin: 'Аккаунт бар ма? Кіріңіз',
    },
  };

  const t = texts[language] || texts.ru;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e9f0] via-[#eef1f5] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden font-sans flex items-center justify-center p-4">
      {/* Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-100/50 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t.subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-8">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 h-14 rounded-2xl text-xl font-bold transition-all ${
                mode === 'login'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70'
              }`}
            >
              {t.login}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 h-14 rounded-2xl text-xl font-bold transition-all ${
                mode === 'register'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white/70'
              }`}
            >
              {t.register}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-lg text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-16 px-6 rounded-2xl bg-white/70 dark:bg-gray-700/70 border-2 border-transparent focus:border-green-500 text-xl text-gray-800 dark:text-white outline-none transition-all"
                  placeholder="Иван Иванов"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                {t.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-16 px-6 rounded-2xl bg-white/70 dark:bg-gray-700/70 border-2 border-transparent focus:border-green-500 text-xl text-gray-800 dark:text-white outline-none transition-all"
                placeholder="ivan123"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-16 px-6 rounded-2xl bg-white/70 dark:bg-gray-700/70 border-2 border-transparent focus:border-green-500 text-xl text-gray-800 dark:text-white outline-none transition-all"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-green-500 text-white text-xl font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-wait transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t.submit}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        .dark .glass-panel {
          background: rgba(30, 30, 40, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
