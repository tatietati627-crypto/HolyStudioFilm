
import React from 'react';
import { Movie } from '../types';
import { X, Play, Heart, Star, Calendar, Users, Camera } from 'lucide-react';
import { soundService } from '../services/soundService';

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onWatch: (movie: Movie) => void;
  t: any;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ movie, onClose, onWatch, t }) => {
  const handleWatch = () => {
    soundService.playClick();
    onWatch(movie);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div 
        className="relative w-full max-w-2xl bg-purple-950/20 backdrop-blur-3xl border border-purple-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] animate-entrance living-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Sakura (Low Opacity) */}
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20 rotate-12">
            <svg viewBox="0 0 100 100" className="w-full h-full text-pink-300 fill-current">
                <circle cx="50" cy="50" r="10" />
                <circle cx="50" cy="30" r="15" />
                <circle cx="50" cy="70" r="15" />
                <circle cx="30" cy="50" r="15" />
                <circle cx="70" cy="50" r="15" />
            </svg>
        </div>

        {/* Modal Header/Buttons */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex gap-4">
            <button 
              onClick={handleWatch}
              className="sakura-button flex items-center gap-2 bg-white text-black px-6 py-3 font-black text-sm hover:bg-pink-100 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
              <Play size={18} fill="black" /> {t.watchMovie}
            </button>
            <button className="sakura-button flex items-center gap-2 bg-purple-900/40 border border-purple-500/20 px-6 py-3 font-bold text-sm hover:bg-purple-800/60 transition-all">
              <Star size={18} className="text-pink-400" /> {t.rateMovie}
            </button>
          </div>
          <button 
            onClick={() => { soundService.playClick(); onClose(); }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-purple-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-8 p-8 overflow-y-auto max-h-[70vh] no-scrollbar">
          <div className="w-full md:w-1/3 flex-shrink-0">
             <img 
               src={movie.coverUrl} 
               alt={movie.title} 
               className="w-full aspect-[2/3] object-cover rounded-[2rem] shadow-2xl border border-white/10"
             />
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white drop-shadow-md">{movie.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-black text-pink-400 uppercase tracking-widest">{movie.genre}</span>
                <div className="w-1 h-1 rounded-full bg-white/30"></div>
                <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">{movie.language}</span>
              </div>
            </div>

            <p className="text-sm text-purple-100/70 leading-relaxed italic">
              {movie.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-300/60 text-[10px] font-black uppercase tracking-widest">
                  <Calendar size={12} /> {t.releaseDate}
                </div>
                <p className="text-sm font-bold text-white">{movie.releaseDate || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-300/60 text-[10px] font-black uppercase tracking-widest">
                  <Camera size={12} /> {t.directors}
                </div>
                <p className="text-sm font-bold text-white">{(movie.directors || []).join(', ') || 'N/A'}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-purple-300/60 text-[10px] font-black uppercase tracking-widest">
                  <Users size={12} /> {t.producers}
                </div>
                <p className="text-sm font-bold text-white">{(movie.producers || []).join(', ') || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;
