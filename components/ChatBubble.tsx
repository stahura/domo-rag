import React from 'react';
import { Message, Sender } from '../types';
import { User, Bot, FileText } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-6 animate-fade-in-up`}
    >
      <div
        className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? 'bg-brand-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}
          >
            {message.text}
          </div>

          {/* Sources Footnote (Bot only) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1 ml-1">
              {message.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-center text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                >
                  <FileText size={10} className="mr-1" />
                  <span className="truncate max-w-[150px]">{source}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <span className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'} px-1`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
