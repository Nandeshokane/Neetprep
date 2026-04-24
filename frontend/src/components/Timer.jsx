import { useState, useEffect, useRef } from 'react';
import { HiOutlineClock } from 'react-icons/hi';

export default function Timer({ duration, onTimeUp, isRunning }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / duration) * 100;

  const getColor = () => {
    if (progress > 50) return 'text-correct';
    if (progress > 20) return 'text-chemistry';
    return 'text-incorrect';
  };

  const getBgColor = () => {
    if (progress > 50) return 'bg-correct';
    if (progress > 20) return 'bg-chemistry';
    return 'bg-incorrect';
  };

  return (
    <div className="flex items-center gap-3">
      <HiOutlineClock className={`w-5 h-5 ${getColor()} ${timeLeft <= 10 ? 'animate-pulse' : ''}`} />
      <div className="flex items-center gap-2">
        <span className={`font-mono text-lg font-bold ${getColor()}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className="w-20 h-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${getBgColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
