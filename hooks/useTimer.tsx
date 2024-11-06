import { useEffect, useState } from 'react';

const useCountdown = (
  targetDate: any
): { timeLeft: number | null; formatTime: () => string } => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate?.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft(difference);
      } else {
        clearInterval(interval);
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = (): string => {
    const time = timeLeft ?? 0;
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    let formattedTime = '';

    if (days > 0) formattedTime += `${days}d `;
    if (hours > 0) formattedTime += `${hours}h `;
    if (minutes > 0) formattedTime += `${minutes}m `;
    if (seconds > 0) formattedTime += `${seconds}s`;

    return formattedTime.trim();
  };

  return { timeLeft, formatTime };
};

export default useCountdown;
