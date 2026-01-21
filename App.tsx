import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Movie, Screen, Language, ADMIN_EMAIL, UserData, AdminRecord } from './types';
import { TRANSLATIONS, INITIAL_MOVIES } from './constants';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import MainScreen from './components/MainScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminScreen from './components/AdminScreen';
import VideoPlayer from './components/VideoPlayer';
import AIAssistant from './components/AIAssistant';
import { Home, User as UserIcon, ShieldCheck } from 'lucide-react';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [secondaryAdmins, setSecondaryAdmins] = useState<AdminRecord[]>([]);
  const [userData, setUserData] = useState<UserData>({
    favorites: [],
    history: [],
    playback: {},
    settings: { language: 'ru' }
  });
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const syncWithStorage = useCallback(() => {
    const storedMovies = localStorage.getItem('hm_movies');
    if (storedMovies) setMovies(JSON.parse(storedMovies));
    else setMovies(INITIAL_MOVIES);

    const storedAdmins = localStorage.getItem('hm_secondary_admins');
    if (storedAdmins) setSecondaryAdmins(JSON.parse(storedAdmins));

    const session = localStorage.getItem('hm_session');
    if (session) {
      const user = JSON.parse(session);
      setCurrentUser(user);
      
      const uData = localStorage.getItem(`hm_data_${user.email}`);
      if (uData) setUserData(JSON.parse(uData));
    }
  }, []);

  useEffect(() => {
    syncWithStorage();
    window.addEventListener('storage', syncWithStorage);
    return () => window.removeEventListener('storage', syncWithStorage);
  }, [syncWithStorage]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`hm_data_${currentUser.email}`, JSON.stringify(userData));
    }
  }, [userData, currentUser]);

  const handleAuth = (user: User) => {
    localStorage.setItem('hm_session', JSON.stringify(user));
    setCurrentUser(user);
    
    const uData = localStorage.getItem(`hm_data_${user.email}`);
    if (uData) {
      setUserData(JSON.parse(uData));
    } else {
      setUserData({
        favorites: [],
        history: [],
        playback: {},
        settings: { language: 'ru' }
      });
    }
    setScreen(Screen.HOME);
  };

  const handleLogout = () => {
    localStorage.removeItem('hm_session');
    setCurrentUser(null);
    setScreen(Screen.AUTH);
  };

  const toggleFavorite = (id: string) => {
    setUserData(prev => ({
      ...prev,
      favorites: prev.favorites.includes(id) 
        ? prev.favorites.filter(f => f !== id) 
        : [...prev.favorites, id]
    }));
  };

  const updatePlayback = (movieId: string, time: number) => {
    setUserData(prev => {
      const history = prev.history.filter(h => h.movieId !== movieId);
      return {
        ...prev,
        playback: { ...prev.playback, [movieId]: time },
        history: [{ movieId, timestamp: Date.now() }, ...history].slice(0, 20)
      };
    });
  };

  const updateMovies = (newMovies: Movie[]) => {
    setMovies(newMovies);
    localStorage.setItem('hm_movies', JSON.stringify(newMovies));
  };

  const updateAdmins = (newAdmins: AdminRecord[]) => {
    setSecondaryAdmins(newAdmins);
    localStorage.setItem('hm_secondary_admins', JSON.stringify(newAdmins));
  };

  const navigateTo = (newScreen: Screen) => {
    soundService.playClick();
    setScreen(newScreen);
  };

  const t = TRANSLATIONS[userData.settings.language];

  const isAnyAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.email === ADMIN_EMAIL) return true;
    return secondaryAdmins.some(admin => admin.email === currentUser.email);
  }, [currentUser, secondaryAdmins]);

  const currentUserPermissions = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.email === ADMIN_EMAIL) {
      return { canPublish: true, canEdit: true, canDelete: true };
    }
    const record = secondaryAdmins.find(admin => admin.email === currentUser.email);
    return record ? record.permissions : null;
  }, [currentUser, secondaryAdmins]);

  if (screen === Screen.SPLASH) {
    return <SplashScreen onComplete={() => setScreen(currentUser ? Screen.HOME : Screen.AUTH)} />;
  }

  return (
    <div className="min-h-screen text-white pb-20 overflow-x-hidden selection:bg-pink-500/30">
      <div className="fixed inset-0 pointer-events-none z-[100] bg-gradient-to-tr from-pink-500/5 via-transparent to-purple-500/5 opacity-40"></div>
      
      <div className="animate-in fade-in duration-1000">
        {!currentUser && screen === Screen.AUTH && <AuthScreen onLogin={handleAuth} t={t} />}
        {currentUser && (
          <>
            {screen === Screen.HOME && (
              <MainScreen 
                movies={movies} 
                favorites={userData.favorites} 
                onPlay={(m) => {
                  soundService.playClick();
                  setScreen(Screen.PLAYER);
                  setActiveMovie(m);
                }} 
                onToggleFavorite={toggleFavorite}
                t={t}
              />
            )}
            {screen === Screen.PROFILE && (
              <ProfileScreen 
                user={currentUser!} 
                userData={userData}
                movies={movies}
                onLogout={handleLogout} 
                language={userData.settings.language} 
                setLanguage={(lang) => setUserData(prev => ({ ...prev, settings: { ...prev.settings, language: lang }}))}
                t={t}
              />
            )}
            {screen === Screen.ADMIN && isAnyAdmin && (
              <AdminScreen 
                movies={movies} 
                onUpdate={updateMovies}
                currentUser={currentUser}
                secondaryAdmins={secondaryAdmins}
                onUpdateAdmins={updateAdmins}
                permissions={currentUserPermissions!}
                t={t}
              />
            )}
          </>
        )}
      </div>

      {/* // Fix: Removed redundant Screen.SPLASH comparison because it's already handled by the early return above. */}
      {currentUser && screen !== Screen.PLAYER && (
        <>
          <AIAssistant movies={movies} t={t} />
          
          <div className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-lg animate-slide-up">
            <nav className="h-22 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] flex items-center justify-around px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(168,85,247,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-transparent pointer-events-none"></div>
              
              <button onClick={() => navigateTo(Screen.HOME)} className={`flex flex-col items-center justify-center relative w-18 h-18 transition-all duration-700 group ${screen === Screen.HOME ? 'text-pink-400 scale-110' : 'text-purple-300/30'}`}>
                <div className={`absolute inset-0 bg-pink-500/10 blur-2xl rounded-full transition-opacity duration-700 ${screen === Screen.HOME ? 'opacity-100' : 'opacity-0'}`}></div>
                <Home size={30} className="transition-all duration-500" />
                <span className={`text-[10px] mt-1.5 font-black uppercase tracking-[0.2em] transition-all duration-500 ${screen === Screen.HOME ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>{t.home}</span>
              </button>
              
              <button onClick={() => navigateTo(Screen.PROFILE)} className={`flex flex-col items-center justify-center relative w-18 h-18 transition-all duration-700 group ${screen === Screen.PROFILE ? 'text-pink-400 scale-110' : 'text-purple-300/30'}`}>
                <div className={`absolute inset-0 bg-pink-500/10 blur-2xl rounded-full transition-opacity duration-700 ${screen === Screen.PROFILE ? 'opacity-100' : 'opacity-0'}`}></div>
                <UserIcon size={30} className="transition-all duration-500" />
                <span className={`text-[10px] mt-1.5 font-black uppercase tracking-[0.2em] transition-all duration-500 ${screen === Screen.PROFILE ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>{t.profile}</span>
              </button>

              {isAnyAdmin && (
                <button onClick={() => navigateTo(Screen.ADMIN)} className={`flex flex-col items-center justify-center relative w-18 h-18 transition-all duration-700 group ${screen === Screen.ADMIN ? 'text-pink-400 scale-110' : 'text-purple-300/30'}`}>
                  <div className={`absolute inset-0 bg-pink-500/10 blur-2xl rounded-full transition-opacity duration-700 ${screen === Screen.ADMIN ? 'opacity-100' : 'opacity-0'}`}></div>
                  <ShieldCheck size={30} className="transition-all duration-500" />
                  <span className={`text-[10px] mt-1.5 font-black uppercase tracking-[0.2em] transition-all duration-500 ${screen === Screen.ADMIN ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>{t.admin}</span>
                </button>
              )}
            </nav>
          </div>
        </>
      )}

      {activeMovie && (
        <VideoPlayer 
          movie={activeMovie} 
          onClose={() => {
            setActiveMovie(null);
            setScreen(Screen.HOME);
          }} 
          savedTime={userData.playback[activeMovie.id] || 0}
          onUpdateProgress={(time) => updatePlayback(activeMovie.id, time)}
        />
      )}
    </div>
  );
};

export default App;
