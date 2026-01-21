
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { soundService } from '../services/soundService';
import { Moon, Star } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  t: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const petals = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${10 + Math.random() * 15}s`,
    delay: `${Math.random() * 10}s`,
    size: `${5 + Math.random() * 8}px`
  })), []);

  const bgStars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: `${2 + Math.random() * 4}s`,
    size: `${Math.random() * 2}px`
  })), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    soundService.playClick();

    const validPassword = /^[A-Za-z0-9]{6,}$/.test(password);
    if (!validPassword) {
      setError('Password must be 6+ characters (letters & numbers only)');
      return;
    }

    const storedUsers: User[] = JSON.parse(localStorage.getItem('hm_users') || '[]');
    
    if (isRegistering) {
      if (storedUsers.some(u => u.email === email)) {
        setError('User already exists');
        return;
      }
      const newUser = { email, password };
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('hm_users', JSON.stringify(updatedUsers));
      onLogin(newUser);
    } else {
      if (email === 'robloxura727@gmail.com' && password === 'admin123') {
        onLogin({ email, password });
        return;
      }

      const user = storedUsers.find(u => u.email === email);
      if (!user) {
        setError(t.errorAccount);
      } else if (user.password !== password) {
        setError(t.errorPassword);
      } else {
        onLogin(user);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        {bgStars.map(star => (
          <div key={star.id} className="star" style={{ top: star.top, left: star.left, width: star.size, height: star.size, '--duration': star.duration } as any} />
        ))}
        {petals.map(petal => (
          <div key={petal.id} className="petal" style={{ left: petal.left, width: petal.size, height: petal.size, animationDuration: petal.duration, animationDelay: petal.delay } as any} />
        ))}
      </div>

      <div className="absolute top-10 right-10 z-0 opacity-40 moon-glow pointer-events-none">
        <Moon size={120} className="text-white fill-white" />
      </div>

      <div className="w-full max-w-sm z-10 animate-entrance">
        <div className="text-center mb-10">
          {/* Обновленный логотип H */}
          <div className="relative inline-block">
             <h1 className="text-8xl font-black italic tracking-tighter sakura-text mb-2 drop-shadow-2xl">H</h1>
             <div className="absolute -bottom-1 -right-2 w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>
          </div>
          <p className="text-purple-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Holy Motion</p>
        </div>

        <div className="glass-card bg-purple-950/20 border-purple-500/20 p-8 rounded-3xl backdrop-blur-xl shadow-[0_0_40px_rgba(88,28,135,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-purple-300/60 tracking-widest ml-1">{t.email}</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 text-sm focus:bg-purple-800/30 focus:border-purple-400 transition-all outline-none placeholder:text-purple-300/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-purple-300/60 tracking-widest ml-1">{t.password}</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 text-sm focus:bg-purple-800/30 focus:border-purple-400 transition-all outline-none placeholder:text-purple-300/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-400 text-xs text-center font-bold px-2 animate-bounce">{error}</p>}

            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all duration-300 active:scale-95">
              {isRegistering ? t.register : t.login}
            </button>
          </form>

          <button onClick={() => { soundService.playClick(); setIsRegistering(!isRegistering); setError(''); }} className="w-full mt-8 text-xs text-purple-300/50 font-bold hover:text-purple-200 transition-colors uppercase tracking-widest">
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
