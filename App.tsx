import React, { useState, useRef, useEffect } from 'react';
import { Send, Database, MessageSquare, Loader2, ChevronDown, Check, FileText } from 'lucide-react';
import { Message, Sender, Fileset } from './types';
import { handleRagChat } from './services/domoService';
import ChatBubble from './components/ChatBubble';
import TypingIndicator from './components/TypingIndicator';

// Available filesets (API integration point for future)
const FILESETS: Fileset[] = [
  { id: 'b0b29ed0-d279-4258-b2d7-d3e8101f54e5', name: 'Default Knowledge Base' },
  { id: 'sales-2023', name: 'Q4 Sales Reports' },
  { id: 'hr-policies', name: 'HR Employee Handbook' },
];

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hello! I am your RAG assistant. I can answer questions based on your connected documents. How can I help you today?',
      sender: Sender.Bot,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileSet, setSelectedFileSet] = useState<string>(FILESETS[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: Sender.User,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Process with RAG Service
      const response = await handleRagChat(userText, selectedFileSet);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: Sender.Bot,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error while processing your request.",
        sender: Sender.Bot,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Keep focus on input for power users
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const selectedFilesetName = FILESETS.find(f => f.id === selectedFileSet)?.name || 'Select Fileset';

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Header with Fileset Dropdown */}
      <header className="flex-none bg-white border-b border-slate-200 shadow-sm z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-brand-600">
          <Database size={28} className="text-brand-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Ryuu Assistant</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">RAG Enabled</p>
          </div>
        </div>

        {/* Fileset Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <div className="flex flex-col items-start mr-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Source</span>
              <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{selectedFilesetName}</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-40 animate-slide-down">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-medium">
                Select Knowledge Base
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {FILESETS.map((fs) => (
                  <button
                    key={fs.id}
                    onClick={() => {
                      setSelectedFileSet(fs.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center overflow-hidden">
                      <FileText size={16} className="text-slate-400 group-hover:text-brand-500 mr-3 flex-shrink-0" />
                      <span className={`text-sm truncate ${selectedFileSet === fs.id ? 'text-brand-600 font-medium' : 'text-slate-600'}`}>
                        {fs.name}
                      </span>
                    </div>
                    {selectedFileSet === fs.id && (
                      <Check size={16} className="text-brand-500 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-gradient-to-b from-slate-50 to-white" id="chat-container">
          <div className="max-w-3xl mx-auto pt-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 mt-20">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p>Start a conversation...</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4 pb-6 md:pb-8 z-20">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-center shadow-lg rounded-2xl ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-500/50 transition-all duration-300 bg-slate-50 focus-within:bg-white focus-within:shadow-xl"
            >
              <div className="pl-5 text-slate-400">
                <MessageSquare size={20} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="w-full bg-transparent border-none focus:ring-0 py-4 px-4 text-slate-700 placeholder-slate-400 text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`mr-3 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  input.trim() && !isLoading
                    ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700 transform hover:scale-105 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
            <div className="text-center mt-3">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Connected to {FILESETS.find(f => f.id === selectedFileSet)?.name}
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;