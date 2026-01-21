
import React, { useEffect, useState, useMemo } from 'react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

  // Генерация лепестков специально для сплэш-скрина, чтобы создать вихрь вокруг H
  const splashPetals = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${3 + Math.random() * 4}s`,
    delay: `${Math.random() * 2}s`,
    size: `${6 + Math.random() * 10}px`,
    rotate: `${Math.random() * 360}deg`
  })), []);

  useEffect(() => {
    const newStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`,
      duration: `${2 + Math.random() * 3}s`
    }));
    setStars(newStars);

    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Звезды на фоне */}
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration
          } as any}
        />
      ))}

      {/* Вихрь лепестков */}
      {splashPetals.map(petal => (
        <div
          key={petal.id}
          className="petal opacity-0"
          style={{
            top: petal.top,
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            transform: `rotate(${petal.rotate})`
          } as any}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center">
        {/* Логотип H из сакуры */}
        <div className="relative">
            <h1 className="text-[12rem] font-bold h-logo-animate sakura-text select-none leading-none">
              H
            </h1>
            {/* Дополнительный слой свечения */}
            <div className="absolute inset-0 blur-3xl bg-pink-500/20 h-logo-animate rounded-full -z-10"></div>
        </div>

        <div 
          className="mt-4 text-white text-opacity-40 text-sm font-black tracking-[0.5em] text-center uppercase h-logo-animate" 
          style={{ animationDelay: '0.3s' }}
        >
          Holy Motion
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
