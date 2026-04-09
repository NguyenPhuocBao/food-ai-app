import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, BarChart2, Calendar as CalendarIcon, Droplets, Target, Flame } from 'lucide-react';

const DiaryPage = () => {
  const [activeTab, setActiveTab] = useState('today');

  const meals = [
    {
      id: "breakfast",
      name: "Bữa Sáng",
      time: "08:30 AM",
      totalCalories: 350,
      items: [
        { name: "Phở Gà (1 tô vừa)", calories: 280, img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?auto=format&fit=crop&q=80&w=150", qty: "1 tô", protein: "25g", carbs: "40g", fat: "8g" },
        { name: "Trà tắc ít đường", calories: 70, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=150", qty: "1 ly", protein: "0g", carbs: "15g", fat: "0g" }
      ]
    },
    {
      id: "lunch",
      name: "Bữa Trưa",
      time: "12:15 PM",
      totalCalories: 520,
      items: [
        { name: "Cơm Gạo Lứt", calories: 110, img: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=150", qty: "1 bát", protein: "3g", carbs: "23g", fat: "1g" },
        { name: "Mực Xào Rau Củ", calories: 310, img: "https://images.unsplash.com/photo-1599487405469-8fd5da47021b?auto=format&fit=crop&q=80&w=150", qty: "200g", protein: "28g", carbs: "12g", fat: "15g" },
      ]
    },
    {
      id: "dinner",
      name: "Bữa Tối",
      time: "--:--",
      totalCalories: 0,
      items: []
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-emerald-500" /> Nhật Ký Dinh Dưỡng
          </h1>
          <p className="text-gray-500 mt-1">Theo dõi nhật ký ăn uống và thống kê Calo chi tiết.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50"><ChevronLeft size={20} /></button>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-gray-900">Hôm nay</p>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Thứ 4, 08 Tháng 4</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Stats Column (Occupies 1 Col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-emerald-600 rounded-[24px] p-6 text-white shadow-lg shadow-emerald-500/20">
            <h3 className="text-emerald-100 text-sm font-medium mb-1">Tổng Calo Nạp</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-black">870</span>
              <span className="text-emerald-200 ml-1">/ 2,000</span>
            </div>
            
            <div className="h-2 bg-emerald-700 rounded-full overflow-hidden mb-2">
               <div className="h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,1)]" style={{ width: '43.5%' }}></div>
            </div>
            <p className="text-xs font-medium text-emerald-100 text-right">Còn lại: 1,130 kcal</p>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold text-gray-900">Thành phần Macro</h4>
               <BarChart2 size={16} className="text-gray-400" />
             </div>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs font-bold mb-1">
                     <span className="text-gray-500 flex items-center gap-1"><Target size={14} className="text-emerald-500"/> Protein</span>
                     <span className="text-gray-900">56g<span className="text-gray-400 font-normal">/120g</span></span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '46%' }}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-xs font-bold mb-1">
                     <span className="text-gray-500 flex items-center gap-1"><Flame size={14} className="text-amber-500"/> Carbs</span>
                     <span className="text-gray-900">77g<span className="text-gray-400 font-normal">/200g</span></span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-amber-400 rounded-full" style={{ width: '38%' }}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-xs font-bold mb-1">
                     <span className="text-gray-500 flex items-center gap-1"><Droplets size={14} className="text-blue-500"/> Fat</span>
                     <span className="text-gray-900">23g<span className="text-gray-400 font-normal">/65g</span></span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-400 rounded-full" style={{ width: '35%' }}></div></div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Timelines Column (Occupies 3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
               {/* Meal Header */}
               <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                     <h3 className="text-lg font-bold text-gray-900">{meal.name}</h3>
                     <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500">{meal.time}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-amber-500 font-bold">{meal.totalCalories} <span className="text-xs text-gray-400 font-medium">KCAL</span></span>
                     <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                        <Plus size={16} /> Thêm món
                     </button>
                  </div>
               </div>

               {/* Meal Items Table View for Web */}
               <div className="p-0">
                 {meal.items.length > 0 ? (
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-white border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">
                         <th className="px-6 py-3 font-medium">Món Ăn</th>
                         <th className="px-6 py-3 font-medium w-32">Khẩu Phần</th>
                         <th className="px-6 py-3 font-medium w-48 hidden md:table-cell">Thành Phần (C/P/F)</th>
                         <th className="px-6 py-3 font-medium text-right w-32">Năng Lượng</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {meal.items.map((item, idx) => (
                         <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                               <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.qty}</td>
                           <td className="px-6 py-4 hidden md:table-cell">
                              <div className="flex gap-2 text-xs font-bold">
                                 <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{item.carbs}</span>
                                 <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{item.protein}</span>
                                 <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.fat}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                             <span className="font-black text-gray-900">{item.calories}</span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                     <span className="text-sm font-medium text-gray-500">Chưa ghi nhận món ăn nào cho bữa này</span>
                     <button className="text-emerald-500 font-bold text-sm hover:underline">Dùng AI Gợi Ý Món</button>
                   </div>
                 )}
               </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DiaryPage;
