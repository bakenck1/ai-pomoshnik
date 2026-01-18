/**
 * Card component for displaying recognition results.
 * Large text, high contrast, clear structure.
 */

'use client';

import { CheckCircle, XCircle, RotateCcw, Edit3 } from 'lucide-react';
import { BigButton } from './BigButton';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface ResultCardProps {
  transcript: string;
  confidence?: number;
  onConfirm: () => void;
  onReject: () => void;
  onRetry: () => void;
  onEdit?: () => void;
}

export function ResultCard({
  transcript,
  confidence,
  onConfirm,
  onReject,
  onRetry,
  onEdit,
}: ResultCardProps) {
  const { language, fontSize } = useAppStore();

  const textSizeClass = {
    normal: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
  }[fontSize];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Result display */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          {t('resultTitle', language)}
        </h2>
        
        <p className={`${textSizeClass} font-medium text-gray-900 leading-relaxed mb-6`}>
          "{transcript}"
        </p>

        {confidence !== undefined && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-lg font-medium">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Confirmation question */}
      <p className="text-2xl font-semibold text-center text-gray-700 mb-6">
        {t('confirmQuestion', language)}
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <BigButton
          variant="success"
          size="xlarge"
          icon={<CheckCircle className="w-8 h-8" />}
          onClick={onConfirm}
        >
          {t('yes', language)}
        </BigButton>
        
        <BigButton
          variant="danger"
          size="xlarge"
          icon={<XCircle className="w-8 h-8" />}
          onClick={onReject}
        >
          {t('no', language)}
        </BigButton>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-4">
        <BigButton
          variant="secondary"
          size="large"
          icon={<RotateCcw className="w-6 h-6" />}
          onClick={onRetry}
        >
          {t('repeat', language)}
        </BigButton>
        
        {onEdit && (
          <BigButton
            variant="secondary"
            size="large"
            icon={<Edit3 className="w-6 h-6" />}
            onClick={onEdit}
          >
            {t('edit', language)}
          </BigButton>
        )}
      </div>
    </div>
  );
}
