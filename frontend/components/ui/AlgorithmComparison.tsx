/**
 * Algorithm comparison display for research purposes.
 * Shows STT algorithm performance in simple, understandable format.
 */

'use client';

import { Clock, Target, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface AlgorithmResult {
  name: string;
  displayName: string;
  processingTimeMs: number;
  confidence: number;
  transcript: string;
}

interface AlgorithmComparisonProps {
  results: AlgorithmResult[];
}

export function AlgorithmComparison({ results }: AlgorithmComparisonProps) {
  const { language, fontSize } = useAppStore();

  const textSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  }[fontSize];

  // Find best results
  const fastestTime = Math.min(...results.map(r => r.processingTimeMs));
  const highestConfidence = Math.max(...results.map(r => r.confidence));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {t('comparisonTitle', language)}
      </h2>

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.name}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100"
          >
            {/* Algorithm name */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {result.displayName}
              </h3>
              {result.processingTimeMs === fastestTime && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {language === 'ru' ? 'Быстрее всех' : 'Ең жылдам'}
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Processing time */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className={`${textSizeClass} font-medium`}>
                    {t('processingTime', language)}
                  </span>
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {result.processingTimeMs}
                  <span className="text-lg font-normal ml-1">
                    {t('milliseconds', language)}
                  </span>
                </p>
              </div>

              {/* Confidence */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Target className="w-5 h-5" />
                  <span className={`${textSizeClass} font-medium`}>
                    {t('accuracy', language)}
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mb-4">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.confidence === highestConfidence
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Transcript preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className={`${textSizeClass} text-gray-700 italic`}>
                "{result.transcript}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Simple explanation */}
      <div className="mt-6 bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
        <p className={`${textSizeClass} text-yellow-800`}>
          {language === 'ru' ? (
            <>
              <strong>Что это значит?</strong> Мы сравниваем разные способы распознавания речи. 
              Чем меньше время — тем быстрее. Чем выше точность — тем лучше понимает.
            </>
          ) : (
            <>
              <strong>Бұл не дегенді білдіреді?</strong> Біз сөйлеуді тану әдістерін салыстырамыз. 
              Уақыт аз болған сайын — жылдамырақ. Дәлдік жоғары болған сайын — жақсырақ түсінеді.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
