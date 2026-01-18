/**
 * Settings modal for language, theme, and font size.
 * Simple controls for elderly users.
 */

'use client';

import { X, Globe, Sun, Moon, Type } from 'lucide-react';
import { useAppStore, FontSize, Theme } from '@/lib/store';
import { t, Language } from '@/lib/i18n';
import { BigButton } from './BigButton';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, theme, setTheme, fontSize, setFontSize } = useAppStore();

  if (!isOpen) return null;

  const OptionButton = ({
    selected,
    onClick,
    children,
  }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-4 px-6 rounded-xl text-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-300',
        selected
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('settings', language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={t('close', language)}
          >
            <X className="w-8 h-8 text-gray-500" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-8">
          {/* Language */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-800">
                {t('language', language)}
              </span>
            </div>
            <div className="flex gap-3">
              <OptionButton
                selected={language === 'ru'}
                onClick={() => setLanguage('ru')}
              >
                🇷🇺 {t('russian', language)}
              </OptionButton>
              <OptionButton
                selected={language === 'kk'}
                onClick={() => setLanguage('kk')}
              >
                🇰🇿 {t('kazakh', language)}
              </OptionButton>
            </div>
          </div>

          {/* Theme */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sun className="w-6 h-6 text-yellow-500" />
              <span className="text-xl font-semibold text-gray-800">
                {t('theme', language)}
              </span>
            </div>
            <div className="flex gap-3">
              <OptionButton
                selected={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-5 h-5 inline mr-2" />
                {t('lightTheme', language)}
              </OptionButton>
              <OptionButton
                selected={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-5 h-5 inline mr-2" />
                {t('darkTheme', language)}
              </OptionButton>
            </div>
          </div>

          {/* Font size */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-6 h-6 text-green-600" />
              <span className="text-xl font-semibold text-gray-800">
                {t('fontSize', language)}
              </span>
            </div>
            <div className="flex gap-3">
              <OptionButton
                selected={fontSize === 'normal'}
                onClick={() => setFontSize('normal')}
              >
                <span className="text-base">A</span>
                <span className="ml-2">{t('small', language)}</span>
              </OptionButton>
              <OptionButton
                selected={fontSize === 'large'}
                onClick={() => setFontSize('large')}
              >
                <span className="text-lg">A</span>
                <span className="ml-2">{t('large', language)}</span>
              </OptionButton>
              <OptionButton
                selected={fontSize === 'xlarge'}
                onClick={() => setFontSize('xlarge')}
              >
                <span className="text-xl">A</span>
                <span className="ml-2">{t('extraLarge', language)}</span>
              </OptionButton>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="p-6 border-t border-gray-200">
          <BigButton
            variant="primary"
            size="large"
            onClick={onClose}
            className="w-full"
          >
            {t('close', language)}
          </BigButton>
        </div>
      </div>
    </div>
  );
}
