
import React, { useEffect, useRef, useState } from 'react';
import { Movie } from '../types';
import { X, Play, Pause, Volume2, Maximize, Subtitles, ChevronLeft } from 'lucide-react';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
  savedTime?: number;
  onUpdateProgress: (time: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onClose, savedTime = 0, onUpdateProgress }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const controlsTimer = useRef<number | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = savedTime;
    }
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        togglePlay();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimer();
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) window.clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
    onUpdateProgress(current);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(newProgress);
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-none group"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <video
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
      />

      {/* Overlays */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={32} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{movie.title}</h2>
            <p className="text-sm text-gray-400">Full HD • 5.1 Surround</p>
          </div>
        </div>

        {/* Center Play Button (only if paused or active click) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={togglePlay} className="p-8 bg-white/10 rounded-full hover:scale-110 transition-transform">
              <Play size={64} fill="white" />
            </button>
          </div>
        )}

        {/* Footer Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex flex-col gap-4">
            <input 
              type="range" 
              className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleProgressChange}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <div className="flex items-center gap-2 group/volume">
                  <Volume2 size={24} />
                  <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                    <input type="range" className="w-24" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2">
                  <Subtitles size={24} />
                  <span className="text-xs uppercase font-bold tracking-widest">CC</span>
                </button>
                <button>
                  <Maximize size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
