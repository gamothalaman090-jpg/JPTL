import React, { useState } from 'react';
import { X, Send, MessageSquare, ShieldCheck, User, Building2, CheckCheck } from 'lucide-react';

export const DirectMessagingModal = ({ isOpen, onClose, currentUserRole = 'tenant' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'landlord',
      senderName: 'Alexander Vance (Landlord)',
      text: 'Hello Sophia! Just checking in — is everything working smoothly with the new HVAC thermostat?',
      time: '10:14 AM',
    },
    {
      id: 2,
      sender: 'tenant',
      senderName: 'Sophia Lin (Tenant)',
      text: 'Hi Alexander! Yes, it works great now. Thank you for dispatching Apex Plumbing yesterday.',
      time: '10:18 AM',
    },
    {
      id: 3,
      sender: 'landlord',
      senderName: 'Alexander Vance (Landlord)',
      text: 'Wonderful! Let me know if you need anything else regarding your upcoming lease renewal.',
      time: '10:20 AM',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUserRole,
      senderName: currentUserRole === 'tenant' ? 'Sophia Lin (Tenant)' : 'Alexander Vance (Landlord)',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0D111D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090C16]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                Direct Portal Communication
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {currentUserRole === 'tenant' ? 'Messaging Property Manager (Alexander Vance)' : 'Messaging Tenant (Sophia Lin - Unit 14B)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-[#070A12]/40">
          {messages.map((m) => {
            const isMe = m.sender === currentUserRole;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-mono text-slate-400 mb-1 px-1">{m.senderName}</span>
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                    <span>{m.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#0D111D] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a secure message..."
            className="flex-1 bg-slate-100 dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs flex items-center gap-1.5 btn-press shadow-md shadow-indigo-600/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
