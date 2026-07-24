import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';
import { formatTime } from '../utils/formatters';
import { useAudio } from '../hooks/useAudio';

interface CountdownTimerProps {
  remainingSeconds: number;
  totalDuration: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  remainingSeconds,
  totalDuration,
  label = 'Time Remaining',
  size = 'md'
}) => {
  const { playTick } = useAudio();
  const percentage = totalDuration > 0 ? Math.max(0, (remainingSeconds / totalDuration) * 100) : 0;
  
  const isWarning = remainingSeconds <= 5 && remainingSeconds > 0;

  useEffect(() => {
    if (isWarning) {
      playTick();
    }
  }, [remainingSeconds, isWarning, playTick]);

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-[#2B477D]/20 shadow-md">
      <div className="relative flex items-center justify-center">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            className="text-[#F8E9C7]"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            className={`transition-all duration-1000 ease-linear ${
              isWarning ? 'text-[#F25F5C] animate-pulse' : 'text-[#2B477D]'
            }`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-black ${isWarning ? 'text-[#F25F5C] scale-110' : 'text-[#2B477D]'} transition-all text-lg`}>
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-xs font-black text-[#2B477D]">
        <Timer className="w-3.5 h-3.5 text-[#2B477D]" />
        <span>{label}</span>
      </div>
    </div>
  );
};
