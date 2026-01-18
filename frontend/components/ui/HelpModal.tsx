/**
 * Help modal with simple instructions for elderly users.
 * Large text, step-by-step guide with icons.
 */

'use client';

import { X, Mic, MessageSquare, CheckCircle, Volume2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { BigButton } from './BigButton';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { language, fontSize } = useAppStore();

  if (!isOpen) return null;

  const textSizeClass = {
    normal: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }[fontSize];

  const steps = [
    {
      icon: <Mic className="w-12 h-12 text-blue-600" />,
      text: t('helpStep1', language),
      description: language === 'ru' 
        ? 'Нажмите на большую синюю кнопку с микрофоном'
        : 'Микрофоны бар үлкен көк түймені басыңыз',
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-green-600" />,
      text: t('helpStep2', language),
      description: language === 'ru'
        ? 'Говорите громко и чётко'
        : 'Қатты және анық сөйлеңіз',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-yellow-600" />,
      text: t('helpStep3', language),
      description: language === 'ru'
        ? 'Нажмите кнопку ещё раз, чтобы остановить запись'
        : 'Жазуды тоқтату үшін түймені қайта басыңыз',
    },
    {
      icon: <Volume2 className="w-12 h-12 text-purple-600" />,
      text: t('helpStep4', language),
      description: language === 'ru'
        ? 'Помощник ответит вам голосом'
        : 'Көмекші сізге дауыспен жауап береді',
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('helpTitle', language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={t('close', language)}
          >
            <X className="w-8 h-8 text-gray-500" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow">
                {step.icon}
              </div>
              <div>
                <p className={`${textSizeClass} font-bold text-gray-800 mb-1`}>
                  {step.text}
                </p>
                <p className="text-lg text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
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
