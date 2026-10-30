import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadlineIso: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

function calculateTimeRemaining(deadlineIso: string): TimeRemaining {
  const targetTime = new Date(deadlineIso).getTime();
  const now = Date.now();
  const diffInSeconds = Math.max(0, Math.floor((targetTime - now) / 1000));

  if (diffInSeconds <= 0 || isNaN(targetTime)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  return { days, hours, minutes, seconds, isEnded: false };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadlineIso }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateTimeRemaining(deadlineIso));

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(deadlineIso));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(deadlineIso));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineIso]);

  if (timeLeft.isEnded) {
    return (
      <div className="countdown-ended" role="status">
        Planlanan toplantı saati geldi. Güncel bilgi için WhatsApp grubunu ziyaret edin.
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="countdown"
      id="countdown"
      aria-label="Toplantıya kalan süre"
      role="timer"
    >
      <div className="time-cell">
        <b>{pad(timeLeft.days)}</b>
        <span>Gün</span>
      </div>
      <div className="time-cell">
        <b>{pad(timeLeft.hours)}</b>
        <span>Saat</span>
      </div>
      <div className="time-cell">
        <b>{pad(timeLeft.minutes)}</b>
        <span>Dakika</span>
      </div>
      <div className="time-cell">
        <b>{pad(timeLeft.seconds)}</b>
        <span>Saniye</span>
      </div>
    </div>
  );
};
