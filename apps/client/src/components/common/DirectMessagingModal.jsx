import React, { useState } from 'react';
import { X, Send, MessageSquare, ShieldCheck, User, Building2, CheckCheck, Search, Phone, Sparkles } from 'lucide-react';

const INITIAL_CONVERSATIONS = {
  'tenant-1': {
    id: 'tenant-1',
    tenantName: 'Sophia Lin',
    unitLabel: 'Unit 14B',
    propertyName: 'Aura Sky Towers',
    phone: '+1 (555) 234-5678',
    unreadCount: 0,
    messages: [
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
    ]
  },
  'tenant-2': {
    id: 'tenant-2',
    tenantName: 'Liam Carter',
    unitLabel: 'Unit 102',
    propertyName: 'Horizon Heights',
    phone: '+1 (555) 876-5432',
    unreadCount: 1,
    messages: [
      {
        id: 1,
        sender: 'tenant',
        senderName: 'Liam Carter (Tenant)',
        text: 'Hi Alexander, my lease renewal contract expires in 30 days. Can we discuss the new monthly rate?',
        time: 'Yesterday',
      },
      {
        id: 2,
        sender: 'landlord',
        senderName: 'Alexander Vance (Landlord)',
        text: 'Hello Liam! I sent over the renewal offer at $1,950/mo with zero price increase. Please review in your portal.',
        time: 'Yesterday',
      },
      {
        id: 3,
        sender: 'tenant',
        senderName: 'Liam Carter (Tenant)',
        text: 'That sounds great! I will sign the electronic agreement this evening.',
        time: '09:45 AM',
      }
    ]
  },
  'tenant-3': {
    id: 'tenant-3',
    tenantName: 'Marcus Vance',
    unitLabel: 'Unit 305',
    propertyName: 'Grand Plaza',
    phone: '+1 (555) 432-1098',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'tenant',
        senderName: 'Marcus Vance (Tenant)',
        text: 'Good afternoon, is parking spot #305 available for guest reservation this weekend?',
        time: 'Aug 26',
      },
      {
        id: 2,
        sender: 'landlord',
        senderName: 'Alexander Vance (Landlord)',
        text: 'Yes Marcus! You can issue a temporary 48h visitor pass right in your resident settings tab.',
        time: 'Aug 26',
      }
    ]
  },
  'tenant-4': {
    id: 'tenant-4',
    tenantName: 'Elena Rostova',
    unitLabel: 'Unit 7A',
    propertyName: 'Parkview Suites',
    phone: '+1 (555) 901-2345',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'tenant',
        senderName: 'Elena Rostova (Tenant)',
        text: 'Hi Alexander, rent payment receipt TXN-88102 was processed via Stripe ACH. Thank you!',
        time: 'Aug 24',
      },
      {
        id: 2,
        sender: 'landlord',
        senderName: 'Alexander Vance (Landlord)',
        text: 'Received Elena! Thank you for paying on time.',
        time: 'Aug 24',
      }
    ]
  }
};

export const DirectMessagingModal = ({ isOpen, onClose, currentUserRole = 'tenant' }) => {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeTenantId, setActiveTenantId] = useState('tenant-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  if (!isOpen) return null;

  const currentConv = conversations[activeTenantId] || conversations['tenant-1'];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUserRole,
      senderName: currentUserRole === 'tenant' ? `${currentConv.tenantName} (Tenant)` : 'Alexander Vance (Landlord)',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) => ({
      ...prev,
      [activeTenantId]: {
        ...prev[activeTenantId],
        unreadCount: 0,
        messages: [...prev[activeTenantId].messages, newMsg]
      }
    }));

    setInputMessage('');
  };

  const filteredTenants = Object.values(conversations).filter((c) =>
    c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.unitLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full ${currentUserRole === 'landlord' ? 'max-w-4xl' : 'max-w-xl'} bg-white dark:bg-[#0D111D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[640px]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090C16] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                Direct Portal & SMS Messaging Center
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                <span>Twilio SMS Gateway &bull; Encrypted 2-Way Relay</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LANDLORD SIDEBAR: Tenant Conversations List */}
          {currentUserRole === 'landlord' && (
            <div className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-[#080B14] shrink-0">
              
              {/* Search Bar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tenant or unit…"
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0D111D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tenant Conversation Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredTenants.map((conv) => {
                  const isActive = conv.id === activeTenantId;
                  const lastMsg = conv.messages[conv.messages.length - 1];

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveTenantId(conv.id);
                        setConversations((prev) => ({
                          ...prev,
                          [conv.id]: { ...prev[conv.id], unreadCount: 0 }
                        }));
                      }}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                        isActive
                          ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 font-grotesk">
                        {conv.tenantName.split(' ').map((n) => n[0]).join('')}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5 font-mono">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-slate-900 dark:text-white font-grotesk truncate">
                            {conv.tenantName}
                          </strong>
                          <span className="text-[10px] text-slate-400">{lastMsg?.time}</span>
                        </div>
                        
                        <span className="text-[10px] text-indigo-500 font-semibold block">{conv.unitLabel} &bull; {conv.propertyName}</span>
                        
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {lastMsg?.text}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE CHAT THREAD AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-[#070A12]/40">
            
            {/* Active Contact Bar */}
            <div className="p-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0D111D]/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-grotesk">
                  {currentUserRole === 'tenant' ? 'AV' : currentConv.tenantName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <strong className="text-xs font-bold font-grotesk text-slate-900 dark:text-white block">
                    {currentUserRole === 'tenant' ? 'Alexander Vance (Property Manager)' : `${currentConv.tenantName} (${currentConv.unitLabel})`}
                  </strong>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" /> {currentUserRole === 'tenant' ? '+1 (555) 987-6543 (Landlord Line)' : currentConv.phone}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold hidden sm:block">
                SMS & Portal Synced
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {currentConv.messages.map((m) => {
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

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#0D111D] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={currentUserRole === 'landlord' ? `Send SMS / Portal message to ${currentConv.tenantName}…` : 'Type a secure message to property manager…'}
                className="flex-1 bg-slate-100 dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs flex items-center gap-1.5 btn-press shadow-md shadow-indigo-600/20 shrink-0"
              >
                <span>Send SMS</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
