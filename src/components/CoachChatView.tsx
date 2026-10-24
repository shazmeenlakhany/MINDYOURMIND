import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CareerProfile } from '../types';

interface CoachChatViewProps {
  messages: ChatMessage[];
  career: CareerProfile;
  onSendMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
}

const COACH_PROMPTS = [
  'I am procrastinating right now. Give me direct, grounded tough love.',
  'Hold me strictly accountable to my active contract stake.',
  'Help me design a realistic 15-minute daily upskilling plan.',
  'I feel overwhelmed by imposter syndrome and dreading work.',
  'What is the single most strategic thing I can do right now?',
];

export const CoachChatView: React.FC<CoachChatViewProps> = ({
  messages,
  career,
  onSendMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    onSendMessage(userMsg);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          careerContext: {
            level: career.level,
            title: career.title,
            streakDays: career.streakDays,
            totalUpskillMinutes: career.totalUpskillMinutes,
          },
          activeContract: career.activeContract,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Let us stay anchored. What is the single step in front of you?',
        timestamp: Date.now(),
      };
      onSendMessage(botMsg);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-fallback-${Date.now()}`,
        role: 'assistant',
        text: 'Action precedes motivation. Choose the first 2 minutes of your top task, close distractions, and begin.',
        timestamp: Date.now(),
      };
      onSendMessage(fallbackMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Mentor Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow">
            AM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">AuraMentor</h1>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Online Partner
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Executive clarity mentor, career strategist & strict accountability partner.
            </p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
        >
          Reset Conversation
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-slate-400 whitespace-nowrap">Ask Coach:</span>
        {COACH_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 tabular-nums">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-slate-900"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Talk to your coach: ask for accountability, career advice, or help with friction..."
            className="flex-1 text-xs sm:text-sm text-slate-900 bg-transparent px-3 py-1.5 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
