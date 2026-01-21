import React, { useState } from 'react';
import { Movie, User, AdminRecord, AdminPermissions, ADMIN_EMAIL, OWNER_CODE } from '../types';
import { Plus, Trash2, Edit2, X, Upload, Star, Shield, Check, UserPlus, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminScreenProps {
  movies: Movie[];
  onUpdate: (movies: Movie[]) => void;
  currentUser: User;
  secondaryAdmins: AdminRecord[];
  onUpdateAdmins: (admins: AdminRecord[]) => void;
  permissions: AdminPermissions;
  t: any;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ 
  movies, onUpdate, currentUser, secondaryAdmins, onUpdateAdmins, permissions, t 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingAdmins, setIsManagingAdmins] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [ownerCode, setOwnerCode] = useState('');
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>({
    canPublish: true,
    canEdit: false,
    canDelete: false
  });
  const [adminError, setAdminError] = useState('');

  const [formData, setFormData] = useState<Partial<Movie>>({
    title: '',
    description: '',
    genre: '',
    language: 'English',
    subtitles: [],
    isTrending: false,
    isNew: true
  });

  const isOwner = currentUser.email === ADMIN_EMAIL;

  const handleAIGenerate = async () => {
    if (!formData.title || isGenerating) return;
    setIsGenerating(true);
    soundService.playClick();

    try {
      // // Fix: Obtain the API key exclusively from process.env.API_KEY directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate details for a movie titled "${formData.title}". Return JSON with: description (string), genre (string), releaseDate (YYYY-MM-DD), directors (array of strings), producers (array of strings).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              genre: { type: Type.STRING },
              releaseDate: { type: Type.STRING },
              directors: { type: Type.ARRAY, items: { type: Type.STRING } },
              producers: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['description', 'genre', 'releaseDate', 'directors', 'producers']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        description: data.description || prev.description,
        genre: data.genre || prev.genre,
        releaseDate: data.releaseDate || prev.releaseDate,
        directors: data.directors || prev.directors,
        producers: data.producers || prev.producers
      }));
    } catch (error) {
      console.error("AI Gen error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (movie: Movie) => {
    if (!permissions.canEdit) return;
    setEditingId(movie.id);
    setFormData(movie);
    setIsAdding(true);
    soundService.playClick();
  };

  const handleDelete = (id: string) => {
    if (!permissions.canDelete) return;
    if (confirm('Delete this movie?')) {
      onUpdate(movies.filter(m => m.id !== id));
      soundService.playClick();
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (ownerCode !== OWNER_CODE) {
      setAdminError(t.invalidCode);
      return;
    }
    const newRecord: AdminRecord = {
      email: newAdminEmail,
      permissions: { ...adminPermissions }
    };
    onUpdateAdmins([...secondaryAdmins, newRecord]);
    setNewAdminEmail('');
    setOwnerCode('');
    soundService.playClick();
  };

  const removeAdmin = (email: string) => {
    if (!isOwner) return;
    onUpdateAdmins(secondaryAdmins.filter(a => a.email !== email));
    soundService.playClick();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, [type === 'cover' ? 'coverUrl' : 'videoUrl']: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.coverUrl || !formData.videoUrl) return;

    soundService.playClick();
    if (editingId) {
      onUpdate(movies.map(m => m.id === editingId ? { ...formData as Movie } : m));
    } else {
      onUpdate([{ ...formData as Movie, id: Date.now().toString() }, ...movies]);
    }
    
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', description: '', genre: '', language: 'English', subtitles: [], isTrending: false, isNew: true });
  };

  return (
    <div className="relative min-h-screen pt-12 p-6 pb-32">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg flex items-center gap-3">
              {t.admin} <Star size={24} className="text-pink-500 fill-pink-500 animate-pulse" />
            </h1>
            <p className="text-purple-300/50 text-xs font-bold uppercase tracking-widest mt-1">Management Studio</p>
          </div>
          
          <div className="flex gap-4">
            {isOwner && (
              <button 
                onClick={() => { soundService.playClick(); setIsManagingAdmins(true); }}
                className="sakura-button flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-4 shadow-lg transition-all"
              >
                <Shield size={20} /> <span className="text-xs font-black uppercase tracking-widest">{t.manageAdmins}</span>
              </button>
            )}
            
            {permissions.canPublish && (
              <button 
                onClick={() => { soundService.playClick(); setIsAdding(true); setEditingId(null); }} 
                className="sakura-button bg-pink-600 hover:bg-pink-500 p-4 shadow-lg active:scale-90"
              >
                <Plus size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {movies.map(movie => (
            <div key={movie.id} className="glass-card bg-purple-950/20 border-purple-500/20 rounded-[2rem] p-5 flex items-center gap-6">
              <img src={movie.coverUrl} className="w-20 h-28 object-cover rounded-2xl shadow-xl" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold truncate text-white">{movie.title}</h3>
                <p className="text-xs text-purple-300/60 font-medium uppercase tracking-widest mt-1">{movie.genre} • {movie.language}</p>
              </div>
              <div className="flex gap-2">
                {permissions.canEdit && (
                  <button onClick={() => handleEdit(movie)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-purple-300">
                    <Edit2 size={18} />
                  </button>
                )}
                {permissions.canDelete && (
                  <button onClick={() => handleDelete(movie.id)} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-400">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isManagingAdmins && isOwner && (
        <div className="fixed inset-0 bg-black/98 z-[110] flex flex-col p-6 overflow-y-auto animate-entrance">
          <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{t.manageAdmins}</h2>
            <button onClick={() => setIsManagingAdmins(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20"><X size={24} /></button>
          </div>
          <div className="max-w-2xl mx-auto w-full space-y-12 pb-12">
            <form onSubmit={handleAddAdmin} className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-3 mb-4 text-pink-400"><UserPlus size={20} /><h3 className="text-sm font-black uppercase tracking-[0.2em]">{t.addAdmin}</h3></div>
              <div className="space-y-4">
                <input type="email" placeholder="admin@gmail.com" className="w-full bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 text-sm outline-none" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required />
                <input type="password" placeholder={t.ownerCode} className="w-full bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 text-sm outline-none" value={ownerCode} onChange={e => setOwnerCode(e.target.value)} required />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-purple-300/60 tracking-widest">{t.permissions}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={adminPermissions.canPublish} onChange={e => setAdminPermissions({...adminPermissions, canPublish: e.target.checked})} />
                    <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${adminPermissions.canPublish ? 'bg-pink-600 border-pink-500' : 'border-purple-500/30'}`}>{adminPermissions.canPublish && <Check size={14} />}</div>
                    <span className="text-xs font-bold text-purple-200">{t.permPublish}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={adminPermissions.canEdit} onChange={e => setAdminPermissions({...adminPermissions, canEdit: e.target.checked})} />
                    <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${adminPermissions.canEdit ? 'bg-pink-600 border-pink-500' : 'border-purple-500/30'}`}>{adminPermissions.canEdit && <Check size={14} />}</div>
                    <span className="text-xs font-bold text-purple-200">{t.permEdit}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" checked={adminPermissions.canDelete} onChange={e => setAdminPermissions({...adminPermissions, canDelete: e.target.checked})} />
                    <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${adminPermissions.canDelete ? 'bg-pink-600 border-pink-500' : 'border-purple-500/30'}`}>{adminPermissions.canDelete && <Check size={14} />}</div>
                    <span className="text-xs font-bold text-purple-200">{t.permDelete}</span>
                  </label>
                </div>
              </div>
              {adminError && <p className="text-red-400 text-xs font-bold animate-pulse">{adminError}</p>}
              <button type="submit" className="w-full bg-pink-600 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-pink-500 transition-all">{t.addAdmin}</button>
            </form>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-300/60 ml-2">Active Admins</h3>
              <div className="grid gap-4">
                {secondaryAdmins.map(admin => (
                  <div key={admin.email} className="glass-card p-6 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{admin.email}</p>
                    </div>
                    <button onClick={() => removeAdmin(admin.email)} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/95 z-[120] flex flex-col p-6 overflow-y-auto animate-entrance">
          <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{editingId ? t.edit : t.addMovie}</h2>
            <button onClick={() => setIsAdding(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20"><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl mx-auto w-full pb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative group">
                   <input type="text" placeholder={t.title} className="w-full bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 text-sm outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                   <button type="button" onClick={handleAIGenerate} disabled={!formData.title || isGenerating} className="absolute right-2 top-2 p-2 bg-pink-600 rounded-xl hover:bg-pink-500 transition-all disabled:opacity-50">
                      <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
                   </button>
                </div>
                <input type="text" placeholder={t.genre} className="w-full bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 text-sm outline-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} required />
                <input type="text" placeholder={t.language} className="w-full bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 text-sm outline-none" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} />
              </div>
              <div className="relative group aspect-[2/3] bg-purple-900/20 border-2 border-dashed border-purple-500/20 rounded-[2.5rem] overflow-hidden flex items-center justify-center cursor-pointer">
                {formData.coverUrl ? <img src={formData.coverUrl} className="absolute inset-0 w-full h-full object-cover" /> : <Upload size={40} className="text-purple-300/30" />}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(e, 'cover')} />
              </div>
            </div>
            <textarea placeholder={t.description} className="w-full bg-purple-900/20 border border-purple-500/20 rounded-3xl p-4 text-sm outline-none min-h-[120px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div className="relative bg-purple-900/20 border-2 border-dashed border-purple-500/20 rounded-3xl p-8 flex flex-col items-center justify-center gap-3">
              <Upload size={32} className="text-purple-300/30" />
              <span className="text-xs font-black uppercase tracking-widest text-purple-300/60">{formData.videoUrl ? 'Video Ready' : 'Choose Video'}</span>
              <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(e, 'video')} />
            </div>
            <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-[0.3em] active:scale-95 transition-all">{t.save}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminScreen;
