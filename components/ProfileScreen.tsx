
import React from 'react';
import { User, Language, UserData, Movie } from '../types';
import { LogOut, Globe, Shield, User as UserIcon, ChevronRight, History, Heart } from 'lucide-react';
import { soundService } from '../services/soundService';

interface ProfileScreenProps {
  user: User;
  userData: UserData;
  movies: Movie[];
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, userData, movies, onLogout, language, setLanguage, t }) => {
  const languages: { code: Language; name: string }[] = [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
    { code: 'ua', name: 'Українська' },
    { code: 'be', name: 'Беларуская' },
    { code: 'kk', name: 'Қазақша' }
  ];

  const favoriteMovies = movies.filter(m => userData.favorites.includes(m.id));
  const historyMovies = userData.history.map(h => movies.find(m => m.id === h.movieId)).filter(Boolean) as Movie[];

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-28 h-28 bg-gradient-to-tr from-pink-600 to-purple-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 animate-pulse">
          <UserIcon size={56} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black italic tracking-tighter">{user.email}</h2>
          <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mt-1">Premium Member</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Col: History & Favorites */}
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4 text-pink-400">
              <History size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">History</h3>
            </div>
            <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/5 max-h-[300px] overflow-y-auto no-scrollbar">
              {historyMovies.length > 0 ? historyMovies.map(movie => (
                <div key={movie.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <img src={movie.coverUrl} className="w-12 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate">{movie.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{movie.genre}</p>
                  </div>
                </div>
              )) : <p className="p-8 text-center text-xs text-gray-600">No viewing history yet</p>}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <Heart size={18} fill="currentColor" />
              <h3 className="text-sm font-black uppercase tracking-widest">{t.favorites}</h3>
            </div>
            <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/5 max-h-[300px] overflow-y-auto no-scrollbar">
              {favoriteMovies.length > 0 ? favoriteMovies.map(movie => (
                <div key={movie.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <img src={movie.coverUrl} className="w-12 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate">{movie.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{movie.genre}</p>
                  </div>
                </div>
              )) : <p className="p-8 text-center text-xs text-gray-600">No favorites yet</p>}
            </div>
          </section>
        </div>

        {/* Right Col: Settings */}
        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4 ml-2">{t.settings}</h3>
            <div className="glass-card rounded-[2rem] overflow-hidden border border-white/10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Globe size={20} className="text-pink-500" />
                  <span className="font-bold text-sm">{t.changeLanguage}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => { soundService.playClick(); setLanguage(lang.code); }}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === lang.code ? 'bg-pink-600 shadow-lg shadow-pink-900/40 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-green-500" />
                  <span className="font-bold text-sm">Security & Privacy</span>
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>
          </section>

          {/* Fix: Call onLogout from props instead of handleLogout */}
          <button onClick={onLogout} className="w-full p-5 glass-card text-red-500 font-black rounded-[2rem] flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all uppercase tracking-[0.2em] border border-red-500/20">
            <LogOut size={20} /> {t.logout}
          </button>
        </div>
      </div>

      <div className="pt-12 text-center opacity-30">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">Holy Motion Streaming System</p>
        <p className="text-[10px] mt-2">v1.2.0 • Build 2024.12</p>
      </div>
    </div>
  );
};

export default ProfileScreen;
