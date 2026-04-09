import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Flame, Droplets, Target, ChevronRight, MessageSquare, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const aiMockRecommendations = [
    { id: 1, name: 'Salad Quinoa Cải Xoăn', cal: 320, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400', tags: ['Giàu khoáng chất'] },
    { id: 2, name: 'Cá Hồi Áp Chảo Măng Tây', cal: 450, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400', tags: ['Omega 3'] },
    { id: 3, name: 'Sinh Tố Bơ Hạt Chia', cal: 250, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=400', tags: ['Ăn nhẹ'] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Main Content (occupies 8 columns on large screens) */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Hero Section */}
           <div className="bg-emerald-600 rounded-[32px] overflow-hidden relative shadow-xl shadow-emerald-500/20">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
              <div className="absolute bottom-0 right-10 w-32 h-32 rounded-full bg-amber-400 opacity-20 blur-2xl"></div>
              <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white space-y-2">
                  <p className="text-emerald-100 font-medium tracking-wide flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-300" /> Cập nhật hôm nay
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight">
                    {getGreeting()}, <br />
                    {user?.name || 'Nguyễn Phước'}!
                  </h1>
                  <p className="text-emerald-50 max-w-md mt-4 text-sm md:text-base leading-relaxed">
                    AI đã phân tích dữ liệu cân nặng gần nhất của bạn và lập kế hoạch giảm mỡ an toàn cho tuần này.
                  </p>
                </div>
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-md rounded-[24px] p-6 text-white w-full md:w-auto border border-white/20">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">Lượng Calo</span>
                    <Flame size={20} className="text-amber-300" />
                  </div>
                  <div className="flex items-baseline mb-4">
                     <span className="text-4xl font-black tracking-tight">1,240</span>
                     <span className="text-emerald-100 ml-1 text-sm">/ 2000 kcal</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-300 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </div>
           </div>

           {/* Stats Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Protein nạp</p>
                  <p className="text-xl font-bold text-gray-900">85g <span className="text-sm font-normal text-gray-400">/ 120g</span></p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Flame size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Carbs nạp</p>
                  <p className="text-xl font-bold text-gray-900">120g <span className="text-sm font-normal text-gray-400">/ 200g</span></p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Droplets size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Chất béo</p>
                  <p className="text-xl font-bold text-gray-900">30g <span className="text-sm font-normal text-gray-400">/ 60g</span></p>
                </div>
              </div>
           </div>

           {/* AI Recommend Grid */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Đề Xuất Dành Riêng Cho Bạn</h2>
                <Link to="/meal-plans" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
                  Xem tất cả Menu <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {aiMockRecommendations.map((food, idx) => (
                    <motion.div 
                      key={food.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                    >
                      <div className="h-40 overflow-hidden relative">
                         <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900">
                           {food.cal} kcal
                         </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 justify-between">
                         <div>
                           <h3 className="font-bold text-gray-900 mb-1 leading-tight">{food.name}</h3>
                           <p className="text-xs text-gray-500 font-medium mb-3">{food.tags[0]}</p>
                         </div>
                         <button className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-sm font-bold rounded-xl transition-colors">
                           Thêm vào Bữa Tối
                         </button>
                      </div>
                    </motion.div>
                 ))}
              </div>
           </div>

        </div>

        {/* Right Sidebar: Quick AI Chat (occupies 4 columns on large screens) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-[600px] border border-gray-100 bg-white shadow-sm flex flex-col rounded-[32px] overflow-hidden">
           {/* Chat Header */}
           <div className="px-6 py-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MessageSquare size={20} /> Trợ Lý AI
                </h3>
                <p className="text-emerald-100 text-xs font-medium mt-1">Sẵn sàng phân tích dinh dưỡng</p>
              </div>
           </div>

           {/* Chat Body Mock */}
           <div className="flex-1 p-5 overflow-y-auto bg-gray-50 space-y-4">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm text-sm text-gray-700 shadow-sm">
                Chào bạn! Để giữ vững Streak 12 ngày, hôm nay bạn muốn lên thực đơn cho bữa tối hay phân tích lượng calo đã nạp?
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                <button className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-xl shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                  Kiểm tra Calo
                </button>
                <button className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-xl shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                  Gợi ý bữa phụ
                </button>
              </div>
           </div>

           {/* Chat Input */}
           <div className="p-4 bg-white border-t border-gray-100 shrink-0">
             <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-full">
               <input 
                 type="text" 
                 placeholder="Hỏi FoodAI..." 
                 className="flex-1 bg-transparent border-0 focus:ring-0 text-sm p-0 text-gray-900"
               />
               <button className="text-emerald-500 hover:text-emerald-600">
                 <Send size={18} />
               </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;