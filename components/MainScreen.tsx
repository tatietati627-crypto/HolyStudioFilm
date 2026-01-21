
import React, { useState, useMemo } from 'react';
import { Movie } from '../types';
import { Search, Play, Info, Moon, Star } from 'lucide-react';
import MovieCard from './MovieCard';
import MovieDetailModal from './MovieDetailModal';

interface MainScreenProps {
  movies: Movie[];
  favorites: string[];
  onPlay: (movie: Movie) => void;
  onToggleFavorite: (id: string) => void;
  t: any;
}

const MainScreen: React.FC<MainScreenProps> = ({ movies, favorites, onPlay, onToggleFavorite, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieInfo, setSelectedMovieInfo] = useState<Movie | null>(null);
  
  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trending = movies.filter(m => m.isTrending);
  const favList = movies.filter(m => favorites.includes(m.id));
  const genres = Array.from(new Set(movies.map(m => m.genre)));

  const bgElements = useMemo(() => {
    const petals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${12 + Math.random() * 18}s`,
      delay: `${Math.random() * -20}s`,
      size: `${4 + Math.random() * 8}px`
    }));
    const stars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 5}s`,
      size: `${Math.random() * 2.5}px`
    }));
    return { petals, stars };
  }, []);

  const heroMovie = trending[0] || movies[0];

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      {/* Magic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {bgElements.stars.map(star => (
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
        {bgElements.petals.map(petal => (
          <div
            key={petal.id}
            className="petal"
            style={{
              left: petal.left,
              width: petal.size,
              height: petal.size,
              animationDuration: petal.duration,
              animationDelay: petal.delay
            } as any}
          />
        ))}
        <div className="absolute top-10 right-10 moon-glow">
          <Moon size={110} className="text-white fill-white" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Sliding Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 px-6 py-5 flex items-center justify-between bg-gradient-to-b from-black via-black/30 to-transparent backdrop-blur-md animate-slide-down">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Обновленный логотип H в шапке */}
            <div className="relative">
                <h1 className="text-4xl font-black sakura-text italic tracking-tighter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">H</h1>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/80 transition-colors">Motion</span>
          </div>
          <div className="relative w-full max-w-xs ml-4 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300/60 group-focus-within:text-pink-400 group-focus-within:scale-110 transition-all duration-300" size={18} />
            <input 
              type="text" 
              placeholder={t.search}
              className="w-full bg-purple-950/20 border border-purple-500/10 rounded-full py-3 pl-12 pr-4 text-sm focus:bg-purple-900/40 focus:border-pink-500/50 transition-all shadow-[inset_0_0_15px_rgba(168,85,247,0.05)] outline-none placeholder:text-purple-300/20 focus:shadow-[0_0_20px_rgba(236,72,153,0.1)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Hero Premiere Section */}
        {!searchQuery && heroMovie && (
          <div className="relative w-full h-[75vh] flex items-end overflow-hidden mb-12 animate-entrance group/hero">
            <img src={heroMovie.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover/hero:scale-105" alt="Hero" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />
            
            <div className="relative z-10 p-6 md:p-20 w-full max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-pink-600 text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.25em] border border-pink-400/50 text-white shadow-[0_0_25px_rgba(219,39,119,0.5)] living-glow">
                  {t.premiere}
                </span>
                <span className="text-purple-300 text-[10px] font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                  <Star size={14} className="fill-purple-300" /> WORLD EXCLUSIVE
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-6 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-none tracking-tighter transition-all group-hover/hero:scale-[1.02] duration-500">
                {heroMovie.title}
              </h1>
              <p className="text-sm md:text-xl text-purple-100/80 mb-10 line-clamp-3 md:line-clamp-none drop-shadow-lg max-w-2xl font-medium leading-relaxed italic">
                {heroMovie.description}
              </p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setSelectedMovieInfo(heroMovie)}
                  className="sakura-button flex items-center gap-4 bg-white text-black px-12 py-5 font-black hover:bg-pink-50 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] active:scale-95 group"
                >
                  <Info size={24} className="group-hover:scale-125 transition-transform" /> {t.play}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Movie Sections */}
        <div className={`px-6 space-y-20 ${searchQuery ? 'mt-32' : 'mt-8'}`}>
          {searchQuery ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovieInfo} />
              ))}
            </div>
          ) : (
            <>
              <section className="relative">
                <div className="flex items-center gap-5 mb-8 px-2">
                   <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">{t.trending}</h2>
                   <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/50 via-pink-500/20 to-transparent"></div>
                </div>
                <div className="flex gap-8 overflow-x-auto pb-10 scroll-smooth no-scrollbar snap-x snap-mandatory px-2">
                  {trending.map(movie => (
                    <div key={movie.id} className="snap-start snap-always">
                      <MovieCard movie={movie} onClick={setSelectedMovieInfo} />
                    </div>
                  ))}
                </div>
              </section>

              {favList.length > 0 && (
                <section className="relative">
                  <div className="flex items-center gap-5 mb-8 px-2">
                     <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">{t.favorites}</h2>
                     <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  </div>
                  <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar snap-x snap-mandatory px-2">
                    {favList.map(movie => (
                      <div key={movie.id} className="snap-start snap-always">
                        <MovieCard movie={movie} onClick={setSelectedMovieInfo} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {genres.map(genre => (
                <section key={genre} className="relative">
                  <div className="flex items-center gap-5 mb-8 px-2">
                     <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">{genre}</h2>
                     <div className="flex-1 h-[2px] bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  </div>
                  <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar snap-x snap-mandatory px-2">
                    {movies.filter(m => m.genre === genre).map(movie => (
                      <div key={movie.id} className="snap-start snap-always">
                        <MovieCard movie={movie} onClick={setSelectedMovieInfo} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </div>

      {selectedMovieInfo && (
        <MovieDetailModal 
          movie={selectedMovieInfo} 
          onClose={() => setSelectedMovieInfo(null)}
          onWatch={(m) => {
             setSelectedMovieInfo(null);
             onPlay(m);
          }}
          t={t}
        />
      )}
    </div>
  );
};

export default MainScreen;
