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
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto bg-white border-x shadow-xl">
      <header className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-bold text-blue-900">Gītā AI</h2>
        <button 
          type="button"
          onClick={() => setMessages([])}
          className="text-xs font-bold text-red-500 uppercase px-2 py-1"
        >
          Reset
        </button>
      </header>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">🙏 Seek wisdom from the Bhagavad-gītā As It Is 🙏</div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-black'
            }`}>
              <p className="text-[10px] font-bold opacity-50 mb-1 uppercase tracking-tighter">
                {m.role === 'user' ? 'You' : 'Sage'}
              </p>
              <div className="text-sm whitespace-pre-wrap">
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-blue-500 text-xs animate-pulse font-bold p-2">The Sage is reflecting...</div>}
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            name="message"
            autoComplete="off"
            className="flex-1 p-3 bg-gray-100 border rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a question..."
          />
          <button 
            type="submit" 
            disabled={isLoading || !userInput?.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all"
          >
            {isLoading ? '...' : 'Ask'}
          </button>
        </form>
      </footer>
    </div>
  );
}