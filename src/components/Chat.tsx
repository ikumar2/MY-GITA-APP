'use client';

import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage.content += chunk;
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = assistantMessage;
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 border-x shadow-2xl">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-6 py-5 shadow-lg border-b-2 border-amber-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">🪈 Bhagavad-gītā Insights</h2>
            <p className="text-amber-100 text-xs font-semibold mt-1">Divine Wisdom at Your Fingertips</p>
          </div>
          <button 
            type="button"
            onClick={() => setMessages([])}
            className="bg-white text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            ↻ Reset
          </button>
        </div>
      </header>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-800 to-blue-500">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🙏</div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300">
                Welcome to Krishna's Wisdom
              </h3>
              <p className="text-slate-300 text-sm max-w-xs">
                Ask any question about the Bhagavad-gītā and receive insights grounded in sacred verses
              </p>
              <div className="pt-4 space-y-2 text-xs text-slate-400">
                <p>💭 "The purpose of knowledge is self-realization"</p>
                <p>✨ Begin your spiritual inquiry below</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg transition-all ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-blue-500/30' 
                : 'bg-gradient-to-br from-amber-100 to-orange-100 text-slate-900 rounded-bl-none shadow-amber-200/50 border-l-4 border-amber-500'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                m.role === 'user' ? 'text-blue-100' : 'text-amber-700'
              }`}>
                {m.role === 'user' ? '👤 You' : ' Sage'}
              </p>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'text-blue-50' : 'text-slate-800'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-900 rounded-2xl px-5 py-4 shadow-lg rounded-bl-none flex items-center gap-2">
              <span className="text-xl animate-spin">✨</span>
              <span className="font-semibold">The Sage is contemplating your question...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-800 px-6 py-4 border-t-2 border-amber-600 shadow-xl">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            name="message"
            autoComplete="off"
            className="flex-1 px-4 py-3 bg-gradient-to-br from-slate-700 to-slate-600 text-white placeholder-slate-400 border-2 border-amber-500/30 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-inner"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about dharma, karma, bhakti, yoga, or any Gita wisdom..."
          />
          <button 
            type="submit" 
            disabled={isLoading || !userInput?.trim()}
            className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 ${
              isLoading || !userInput?.trim()
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
            }`}
          >
            {isLoading ? '⏳ Waiting...' : '✨ Ask'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-700/50 space-y-1">
        <p className="font-semibold text-slate-300">🙏 Non-commercial Educational Resource 🙏</p>
        <p className="text-slate-500">AI responses may vary; always consult authentic scriptures</p>
      </div>
    </div>
  );
}