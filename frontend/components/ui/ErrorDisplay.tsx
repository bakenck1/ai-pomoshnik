/**
 * Error display component with clear messages for elderly users.
 * Simple language, helpful hints, retry option.
 */

'use client';

import { AlertCircle, Mic, Wifi, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { BigButton } from './BigButton';

type ErrorType = 'microphone' | 'network' | 'general';

interface ErrorDisplayProps {
  type: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ type, onRetry, onDismiss }: ErrorDisplayProps) {
  const { language, fontSize } = useAppStore();

  const textSizeClass = {
    normal: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }[fontSize];

  const errorConfig = {
    microphone: {
      icon: <Mic className="w-16 h-16 text-red-500" />,
      title: t('errorMicrophone', language),
      hint: t('errorMicrophoneHint', language),
      color: 'red',
    },
    network: {
      icon: <Wifi className="w-16 h-16 text-orange-500" />,
      title: t('errorNetwork', language),
      hint: t('errorNetworkHint', language),
      color: 'orange',
    },
    general: {
      icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
      title: t('errorGeneral', language),
      hint: '',
      color: 'yellow',
    },
  };

  const config = errorConfig[type];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className={`bg-${config.color}-50 rounded-3xl p-8 text-center border-2 border-${config.color}-200`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className={`${textSizeClass} font-bold text-gray-800 mb-4`}>
          {config.title}
        </h2>

        {/* Hint */}
        {config.hint && (
          <p className="text-lg text-gray-600 mb-8">
            {config.hint}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {onRetry && (
            <BigButton
              variant="primary"
              size="large"
              icon={<RefreshCw className="w-6 h-6" />}
              onClick={onRetry}
              className="w-full"
            >
              {t('tryAgain', language)}
            </BigButton>
          )}
          
          {onDismiss && (
            <BigButton
              variant="secondary"
              size="normal"
              onClick={onDismiss}
              className="w-full"
            >
              {t('close', language)}
            </BigButton>
          )}
        </div>
      </div>
    </div>
  );
}
