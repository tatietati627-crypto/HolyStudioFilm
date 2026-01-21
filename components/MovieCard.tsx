
import React from 'react';
import { Movie } from '../types';
import { soundService } from '../services/soundService';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    soundService.playClick();
    const el = e.currentTarget as HTMLElement;
    el.style.transform = 'scale(1.1) translateY(-10px)';
    el.style.zIndex = '50';
    
    setTimeout(() => {
      onClick(movie);
      el.style.transform = '';
      el.style.zIndex = '';
    }, 250);
  };

  return (
    <div 
      onClick={handleClick}
      className="flex-shrink-0 w-48 md:w-64 group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] aspect-[2/3] shadow-[0_15px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[0_25px_60px_rgba(168,85,247,0.4)] transition-all duration-700 group-hover:-translate-y-4 border-2 border-transparent group-hover:border-purple-400/50 living-glow">
        <img 
          src={movie.coverUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
        />
        
        {/* Living Magical Overlay / Shimmering Edge */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
        
        {/* Animated Light Streaks/Glow streaks on edges */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 pointer-events-none bg-gradient-to-tr from-transparent via-pink-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        
        {/* Content reveal */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-6 group-hover:translate-y-0 transition-all duration-700 delay-75">
          <p className="text-white font-black text-xl leading-tight mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">{movie.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-pink-300 font-black uppercase tracking-[0.2em]">{movie.genre}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
            <span className="text-[10px] text-purple-200 font-bold uppercase tracking-[0.15em]">{movie.language}</span>
          </div>
        </div>

        {movie.isNew && (
          <div className="absolute top-5 left-5 bg-gradient-to-r from-pink-600 to-rose-600 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-white/30 shadow-[0_0_20px_rgba(219,39,119,0.5)] z-20 animate-pulse">
            NEW
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
