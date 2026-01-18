/**
 * Accessible audio player for TTS responses.
 * Large controls, clear feedback, volume control.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, MessageSquare } from 'lucide-react';
import { BigButton } from './BigButton';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  text: string;
  audioUrl: string;
  onComplete?: () => void;
  onNewQuestion?: () => void;
}

export function AudioPlayer({ text, audioUrl, onComplete, onNewQuestion }: AudioPlayerProps) {
  const { language, fontSize } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Build full audio URL
  const fullAudioUrl = audioUrl.startsWith('http')
    ? audioUrl
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${audioUrl}`;

  const textSizeClass = {
    normal: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
  }[fontSize];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleCanPlay = () => {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const replay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Response text */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
        <div className="flex items-center gap-3 text-blue-600 mb-4">
          <Volume2 className="w-8 h-8" />
          <h2 className="text-xl font-semibold">
            {t('responseTitle', language)}
          </h2>
        </div>
        
        <p className={`${textSizeClass} font-medium text-gray-900 leading-relaxed`}>
          {text}
        </p>
      </div>

      {/* Audio player */}
      <div className="bg-gray-100 rounded-3xl p-6 mb-6">
        <audio ref={audioRef} src={fullAudioUrl} preload="auto" />
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlayback}
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              'transition-all duration-200 shadow-lg',
              'focus:outline-none focus:ring-4 focus:ring-blue-300',
              isPlaying
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
            aria-label={isPlaying ? t('pauseButton', language) : t('playButton', language)}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" />
            )}
          </button>

          {/* Volume */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              'bg-gray-200 hover:bg-gray-300 transition-colors',
              'focus:outline-none focus:ring-4 focus:ring-gray-300'
            )}
            aria-label={t('volumeControl', language)}
          >
            {isMuted ? (
              <VolumeX className="w-7 h-7 text-gray-600" />
            ) : (
              <Volume2 className="w-7 h-7 text-gray-600" />
            )}
          </button>
        </div>

        {/* Volume slider */}
        <div className="mt-4 flex items-center gap-4 px-4">
          <VolumeX className="w-6 h-6 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-3 bg-gray-300 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:bg-blue-600
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:cursor-pointer"
            aria-label={t('volumeControl', language)}
          />
          <Volume2 className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <BigButton
          variant="secondary"
          size="large"
          icon={<RotateCcw className="w-6 h-6" />}
          onClick={replay}
        >
          {t('playAgain', language)}
        </BigButton>
        
        <BigButton
          variant="primary"
          size="large"
          icon={<MessageSquare className="w-6 h-6" />}
          onClick={onNewQuestion}
        >
          {t('newQuestion', language)}
        </BigButton>
      </div>
    </div>
  );
}
