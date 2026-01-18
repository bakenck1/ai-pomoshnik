/**
 * Application header with language switch and settings.
 * Simple, accessible navigation.
 */

'use client';

import { useState } from 'react';
import { Settings, HelpCircle, History, Globe } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t, Language } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onOpenHistory?: () => void;
}

export function Header({ onOpenSettings, onOpenHelp, onOpenHistory }: HeaderProps) {
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kk' : 'ru');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <h1 className="text-2xl font-bold text-blue-600">
            {t('appTitle', language)}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'bg-gray-100 hover:bg-gray-200 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-300',
                'text-lg font-medium text-gray-700'
              )}
              aria-label={t('language', language)}
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'ru' ? 'KZ' : 'RU'}</span>
            </button>

            {/* History */}
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className={cn(
                  'p-3 rounded-xl',
                  'bg-gray-100 hover:bg-gray-200 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-300'
                )}
                aria-label={t('historyTitle', language)}
              >
                <History className="w-6 h-6 text-gray-600" />
              </button>
            )}

            {/* Help */}
            {onOpenHelp && (
              <button
                onClick={onOpenHelp}
                className={cn(
                  'p-3 rounded-xl',
                  'bg-gray-100 hover:bg-gray-200 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-300'
                )}
                aria-label={t('help', language)}
              >
                <HelpCircle className="w-6 h-6 text-gray-600" />
              </button>
            )}

            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={cn(
                  'p-3 rounded-xl',
                  'bg-gray-100 hover:bg-gray-200 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-300'
                )}
                aria-label={t('settings', language)}
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
