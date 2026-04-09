import React, { useState } from 'react';
import { Send, Camera, Bot, User, Sparkles, MessageSquare, Plus, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatPage = () => {
  const [message, setMessage] = useState('');

  const suggestions = [
    "Gợi ý bữa tối dưới 500 calo",
    "Tôi dị ứng hải sản, hôm nay ăn gì?",
    "Tạo thực đơn chay cho tuần này",
    "Làm sao để nấu ức gà không bị khô?"
  ];

  const chatHistory = [
    {
      id: 1,
      role: 'assistant',
      content: 'Chào bạn! Tôi là trợ lý dinh dưỡng Food AI. Hôm nay tôi có thể giúp gì cho mục tiêu sức khỏe của bạn?'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] min-h-[600px] flex gap-6">
      
      {/* Left Sidebar: Histories */}
      <div className="hidden lg:flex w-80 bg-white rounded-[32px] border border-gray-100 shadow-sm flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col gap-4">
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            <Plus size={20} /> Cuộc Trò Chuyện Mới
          </button>
          <div className="relative">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Tìm đoạn chat..." className="w-full bg-gray-50 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 text-gray-600" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-3 py-2">Tuần này</p>
           <button className="w-full text-left p-3 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col gap-1 transition-colors">
             <span className="font-bold text-sm truncate">Thực đơn chay 7 ngày</span>
             <span className="text-xs opacity-70 flex items-center gap-1"><Clock size={12} /> Hôm qua</span>
           </button>
           <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 flex flex-col gap-1 transition-colors">
             <span className="font-bold text-sm truncate">Tính calo suất bún chả</span>
             <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Thứ 2</span>
           </button>
           <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 flex flex-col gap-1 transition-colors">
             <span className="font-bold text-sm truncate">Mẹo ăn Eat Clean</span>
             <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> T.CN</span>
           </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-[12px] bg-emerald-100 text-emerald-600 flex items-center justify-center">
               <Bot size={24} strokeWidth={2.5} />
             </div>
             <div>
               <h1 className="text-gray-900 font-bold text-lg leading-tight flex items-center gap-2">
                 Food AI <Sparkles size={16} className="text-amber-500" />
               </h1>
               <p className="text-xs text-gray-500 font-medium">Bác sĩ dinh dưỡng ảo của bạn</p>
             </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          
          <div className="max-w-3xl mx-auto space-y-6 w-full">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center mt-1 border border-white shadow-sm ${
                  msg.role === 'user' ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={20} strokeWidth={2.5} />}
                </div>
                
                {/* Message Bubble */}
                <div className={`p-4 text-[15px] leading-relaxed shadow-sm  ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Suggestions layout for Web */}
            <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              {suggestions.map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button 
                    onClick={() => setMessage(text)}
                    className="w-full text-left bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 text-gray-700 hover:text-emerald-700 text-sm px-5 py-3.5 rounded-[20px] transition-all shadow-sm font-medium flex items-center gap-3 group"
                  >
                    <MessageSquare size={16} className="text-gray-400 group-hover:text-emerald-500" />
                    {text}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Input Footer */}
        <div className="p-6 bg-white border-t border-gray-50 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex relative items-end bg-gray-50 rounded-[24px] p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all border border-gray-100 shadow-inner">
              <button type="button" className="p-3 text-gray-400 hover:text-emerald-500 shrink-0 bg-white rounded-[16px] shadow-sm ml-1 mb-1 transition-colors">
                <Camera size={22} />
              </button>
              
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhắn tin cho Food AI..."
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-48 min-h-[52px] py-3.5 px-4 text-base text-gray-900 placeholder-gray-400 font-medium scrollbar-hide"
                rows={1}
              />

              <button 
                type="submit" 
                disabled={!message.trim()}
                className={`p-3.5 rounded-[16px] shrink-0 mb-1 mr-1 shadow-sm transition-all flex items-center justify-center ${
                  message.trim() 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600' 
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send size={20} className={message.trim() ? "ml-1" : ""} />
              </button>
            </form>
            <p className="text-center text-[11px] text-gray-400 mt-3 font-medium">
              Food AI có thể mắc lỗi. Vui lòng kiểm tra lại các thông tin dinh dưỡng quan trọng.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
