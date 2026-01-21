import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Sparkles, Bot } from 'lucide-react';
import { ChatMessage, Movie } from '../types';
import { soundService } from '../services/soundService';

interface AIAssistantProps {
  movies: Movie[];
  t: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ movies, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    soundService.playClick();
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // // Fix: Obtain the API key exclusively from process.env.API_KEY directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const movieContext = movies.map(m => `- ${m.title} (${m.genre}): ${m.description}`).join('\n');
      
      const prompt = `You are "Sakura Spirit", the AI assistant for Holy Motion movie streaming. 
      You are helpful, magical, and polite. 
      Here is our current movie catalog:
      ${movieContext}
      
      Answer the user's question. If they ask for recommendations, use the catalog above. 
      The user says: "${input}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const aiText = response.text || "The spirits are silent for now...";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, my magical connection is weak right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-28 right-6 z-[60]">
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => { setIsOpen(true); soundService.playClick(); }}
          className="w-14 h-14 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-white/20 animate-bounce hover:scale-110 transition-transform"
        >
          <Sparkles className="text-white" size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] max-w-sm h-[500px] glass-card rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden animate-entrance shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot size={20} className="text-pink-400" />
              <span className="font-black text-sm uppercase tracking-widest">{t.aiAssistant}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={18} /></button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {messages.length === 0 && (
              <p className="text-center text-xs text-purple-300/40 mt-10">I am the Spirit of Motion. Ask me for recommendations!</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${
                  m.role === 'user' 
                  ? 'bg-pink-600/20 border border-pink-500/20 text-white rounded-tr-none' 
                  : 'bg-purple-900/20 border border-purple-500/10 text-purple-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-purple-900/20 border border-purple-500/10 p-4 rounded-3xl animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <input 
              type="text" 
              placeholder={t.aiPlaceholder}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-pink-500/30 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="p-3 bg-pink-600 rounded-2xl hover:bg-pink-500 transition-colors shadow-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
