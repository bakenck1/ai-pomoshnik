/**
 * Large microphone button for voice recording.
 * Designed for elderly users with clear visual feedback.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface MicrophoneButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
  disabled,
}: MicrophoneButtonProps) {
  const { language } = useAppStore();
  const [recordingTime, setRecordingTime] = useState(0);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = useCallback(() => {
    if (isProcessing || disabled) return;
    
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  }, [isRecording, isProcessing, disabled, onStart, onStop]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        aria-label={t('microphoneButton', language)}
        className={cn(
          'relative w-40 h-40 rounded-full transition-all duration-300',
          'flex items-center justify-center',
          'focus:outline-none focus:ring-4 focus:ring-offset-4',
          'touch-manipulation select-none',
          'shadow-2xl',
          isRecording
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-110'
            : isProcessing
            ? 'bg-yellow-500 cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 hover:scale-105',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Pulse animation when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
            <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-20" />
          </>
        )}
        
        {/* Processing spinner */}
        {isProcessing && (
          <span className="absolute inset-0 rounded-full border-4 border-yellow-300 border-t-transparent animate-spin" />
        )}
        
        {/* Icon */}
        <span className="relative z-10 text-white">
          {isRecording ? (
            <Square className="w-16 h-16" fill="currentColor" />
          ) : isProcessing ? (
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Mic className="w-16 h-16" />
          )}
        </span>
      </button>

      {/* Status text */}
      <div className="text-center min-h-[80px]">
        {isRecording ? (
          <>
            <p className="text-2xl font-bold text-red-600 animate-pulse">
              {t('recording', language)}
            </p>
            <p className="text-4xl font-mono font-bold text-gray-800 mt-2">
              {formatTime(recordingTime)}
            </p>
            <p className="text-lg text-gray-600 mt-1">
              {t('recordingHint', language)}
            </p>
          </>
        ) : isProcessing ? (
          <>
            <p className="text-2xl font-bold text-yellow-600">
              {t('processing', language)}
            </p>
            <p className="text-lg text-gray-600 mt-2">
              {t('processingHint', language)}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-blue-600">
              {t('speakButton', language)}
            </p>
            <p className="text-lg text-gray-600 mt-2">
              {t('speakHint', language)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
