/**
 * Research Admin Panel - Full featured with working navigation.
 * Only accessible by admin users.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, ProviderMetrics, Conversation, User } from '@/services/api';
import { useAppStore } from '@/lib/store';

type TabId = 'dashboard' | 'research' | 'users' | 'conversations' | 'settings';

export default function ResearchPanel() {
  const router = useRouter();
  const { isAuthenticated, user, logout, language, setLanguage, theme, toggleTheme } = useAppStore();
  const [metrics, setMetrics] = useState<ProviderMetrics[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, conversationsData, usersData] = await Promise.all([
        adminApi.getAnalytics().catch(() => ({ metrics: [] })),
        adminApi.getConversations().catch(() => []),
        adminApi.getUsers().catch(() => []),
      ]);
      setMetrics(analyticsData.metrics || []);
      setConversations(conversationsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Localized text
  const t = language === 'ru' ? {
    title: 'Панель исследований',
    dashboard: 'Главная',
    research: 'Данные',
    users: 'Пользователи',
    conversations: 'Диалоги',
    settings: 'Настройки',
    logout: 'Выйти',
    home: 'На главную',
    totalInteractions: 'Всего взаимодействий',
    avgConfidence: 'Средняя уверенность',
    latency: 'Задержка ответа',
    totalUsers: 'Пользователей',
    totalConversations: 'Диалогов',
    recentLogs: 'Последние записи',
    userList: 'Список пользователей',
    conversationList: 'Список диалогов',
    name: 'Имя',
    role: 'Роль',
    provider: 'Провайдер',
    created: 'Создан',
    status: 'Статус',
    actions: 'Действия',
    view: 'Просмотр',
    lightTheme: 'Светлая тема',
    darkTheme: 'Тёмная тема',
    language: 'Язык',
    theme: 'Тема',
    refresh: 'Обновить',
    admin: 'Админ',
    senior: 'Пользователь',
    noData: 'Нет данных',
  } : {
    title: 'Зерттеу панелі',
    dashboard: 'Басты',
    research: 'Деректер',
    users: 'Пайдаланушылар',
    conversations: 'Диалогтар',
    settings: 'Баптаулар',
    logout: 'Шығу',
    home: 'Басты бетке',
    totalInteractions: 'Барлық өзара әрекеттер',
    avgConfidence: 'Орташа сенімділік',
    latency: 'Жауап кідірісі',
    totalUsers: 'Пайдаланушылар',
    totalConversations: 'Диалогтар',
    recentLogs: 'Соңғы жазбалар',
    userList: 'Пайдаланушылар тізімі',
    conversationList: 'Диалогтар тізімі',
    name: 'Аты',
    role: 'Рөлі',
    provider: 'Провайдер',
    created: 'Құрылған',
    status: 'Күйі',
    actions: 'Әрекеттер',
    view: 'Көру',
    lightTheme: 'Жарық тақырып',
    darkTheme: 'Қараңғы тақырып',
    language: 'Тіл',
    theme: 'Тақырып',
    refresh: 'Жаңарту',
    admin: 'Админ',
    senior: 'Пайдаланушы',
    noData: 'Деректер жоқ',
  };

  const tabs = [
    { id: 'dashboard' as TabId, label: t.dashboard, icon: 'dashboard' },
    { id: 'research' as TabId, label: t.research, icon: 'science' },
    { id: 'users' as TabId, label: t.users, icon: 'people' },
    { id: 'conversations' as TabId, label: t.conversations, icon: 'chat' },
    { id: 'settings' as TabId, label: t.settings, icon: 'settings' },
  ];

  const mockLogs = [
    { id: '#829', text: 'Напомни мне принять лекарство', confidence: 98.5, time: '2 мин назад' },
    { id: '#830', text: 'Включи музыку', confidence: 94.2, time: '5 мин назад' },
    { id: '#831', text: 'Позвони внучке', confidence: 78.1, time: '8 мин назад' },
    { id: '#832', text: 'Какая погода?', confidence: 99.1, time: '12 мин назад' },
  ];

  if (!isAuthenticated || !isAdmin) return null;

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">science</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{t.title}</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {language === 'ru' ? '🇰🇿 KZ' : '🇷🇺 RU'}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {t.home}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className={`flex gap-2 mb-6 p-1 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-500">groups</span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.totalUsers}</span>
                </div>
                <p className="text-3xl font-bold">{users.length || 0}</p>
              </div>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500">chat</span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.totalConversations}</span>
                </div>
                <p className="text-3xl font-bold">{conversations.length || 0}</p>
              </div>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-500">speed</span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.avgConfidence}</span>
                </div>
                <p className="text-3xl font-bold">{metrics[0]?.avg_confidence ? (metrics[0].avg_confidence * 100).toFixed(0) : 85}%</p>
              </div>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-500">timer</span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.latency}</span>
                </div>
                <p className="text-3xl font-bold">{metrics[0]?.avg_stt_latency_ms || 120}ms</p>
              </div>
            </div>

            {/* Recent Logs */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t.recentLogs}</h3>
                <button onClick={loadData} className="text-green-500 hover:text-green-400 text-sm font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  {t.refresh}
                </button>
              </div>
              <div className="space-y-3">
                {mockLogs.map((log) => (
                  <div key={log.id} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{log.id}</span>
                      <span>{log.text}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{log.time}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${log.confidence >= 90 ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        {log.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-4">STT Model Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Transcription</th>
                      <th className="text-center py-3 px-4 font-medium">WER</th>
                      <th className="text-right py-3 px-4 font-medium">{t.avgConfidence}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLogs.map((log) => (
                      <tr key={log.id} className={`border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                        <td className={`py-4 px-4 font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{log.id}</td>
                        <td className="py-4 px-4">{log.text}</td>
                        <td className="py-4 px-4 text-center">{(100 - log.confidence).toFixed(1)}%</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${log.confidence >= 90 ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                            {log.confidence}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-4">Accuracy Trend</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {[85, 88, 92, 87, 95, 91, 94].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-green-500 rounded-t" style={{ height: `${val}%` }} />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.userList}</h3>
              <button onClick={loadData} className="text-green-500 hover:text-green-400 text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">refresh</span>
                {t.refresh}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.noData}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4 font-medium">{t.name}</th>
                      <th className="text-left py-3 px-4 font-medium">{t.role}</th>
                      <th className="text-left py-3 px-4 font-medium">{t.provider}</th>
                      <th className="text-left py-3 px-4 font-medium">{t.created}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={`border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                              {u.name.charAt(0)}
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {u.role === 'admin' ? t.admin : t.senior}
                          </span>
                        </td>
                        <td className="py-4 px-4">{u.stt_provider}</td>
                        <td className={`py-4 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.conversationList}</h3>
              <button onClick={loadData} className="text-green-500 hover:text-green-400 text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">refresh</span>
                {t.refresh}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : conversations.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t.noData}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">{t.name}</th>
                      <th className="text-left py-3 px-4 font-medium">{t.provider}</th>
                      <th className="text-left py-3 px-4 font-medium">{t.created}</th>
                      <th className="text-right py-3 px-4 font-medium">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((conv) => (
                      <tr key={conv.id} className={`border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                        <td className={`py-4 px-4 font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conv.id.slice(0, 8)}...
                        </td>
                        <td className="py-4 px-4">{conv.user_name || 'Unknown'}</td>
                        <td className="py-4 px-4">{conv.stt_provider_used}</td>
                        <td className={`py-4 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(conv.started_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-green-500 hover:text-green-400 text-sm font-medium">
                            {t.view}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-6">{t.settings}</h3>
              
              <div className="space-y-6">
                {/* Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.language}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {language === 'ru' ? 'Русский' : 'Қазақша'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLanguage('ru')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${language === 'ru' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      🇷🇺 Русский
                    </button>
                    <button
                      onClick={() => setLanguage('kk')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${language === 'kk' ? 'bg-green-500 text-white' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      🇰🇿 Қазақша
                    </button>
                  </div>
                </div>

                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                {/* Theme */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.theme}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isDark ? t.darkTheme : t.lightTheme}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (isDark) toggleTheme(); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${!isDark ? 'bg-green-500 text-white' : 'bg-gray-700'}`}
                    >
                      <span className="material-symbols-outlined text-lg">light_mode</span>
                      {t.lightTheme}
                    </button>
                    <button
                      onClick={() => { if (!isDark) toggleTheme(); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isDark ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                    >
                      <span className="material-symbols-outlined text-lg">dark_mode</span>
                      {t.darkTheme}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Material Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap" rel="stylesheet" />
    </div>
  );
}
