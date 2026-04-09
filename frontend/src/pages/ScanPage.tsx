import React, { useState } from 'react';
import { Camera, Zap, UploadCloud, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        name: 'Salad Gà Nướng Mật Ong',
        confidence: 96,
        calories: 345,
        protein: 35,
        carbs: 12,
        fat: 15,
        ingredients: ['Ức gà', 'Xà lách', 'Cà chua bi', 'Sốt mật ong']
      });
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
           <Camera size={28} className="text-emerald-500" /> Quét Món Ăn Bằng AI
         </h1>
         <p className="text-gray-500 text-sm mt-1">Đưa camera vào phần ăn hoặc tải ảnh từ máy tính để phân tích calo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* Left Pane: Camera or Upload */}
        <div className="lg:col-span-8 bg-black rounded-[32px] overflow-hidden relative shadow-lg h-full flex flex-col">
          {/* Mock Camera Viewfinder */}
          <img 
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200" 
            alt="Camera View" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
             <div className="w-80 h-80 sm:w-96 sm:h-96 border-2 border-dashed border-white/50 rounded-3xl relative">
                {/* Corners */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl"></div>

                {isScanning && (
                  <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_20px_4px_#10B981] z-20"
                  />
                )}
             </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-medium transition-colors flex items-center gap-2">
               <UploadCloud size={20} /> Tải ảnh lên
             </button>
             <button 
                onClick={handleSimulateScan}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all"
             >
                <Camera size={28} />
             </button>
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-medium transition-colors flex items-center gap-2">
               <RefreshCcw size={20} /> Đổi Camera
             </button>
          </div>
        </div>

        {/* Right Pane: Results */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm flex flex-col h-full overflow-y-auto">
           {scanResult ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                 <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-100">
                        <CheckCircle2 size={14} /> Khớp {scanResult.confidence}%
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{scanResult.name}</h2>
                    </div>
                 </div>

                 {/* Macro Blocks */}
                 <div className="bg-emerald-600 text-white rounded-[24px] p-5 shadow-lg shadow-emerald-500/20 mb-6 flex justify-between items-center">
                    <div>
                       <p className="text-emerald-100 text-sm font-medium">Tổng Calo Mồ Phỏng</p>
                       <p className="text-4xl font-black">{scanResult.calories} <span className="text-xl font-medium text-emerald-200">kcal</span></p>
                    </div>
                    <Zap size={40} className="text-amber-300 opacity-80" />
                 </div>

                 <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                      <p className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-wider">Carbs</p>
                      <p className="text-lg font-black text-gray-900">{scanResult.carbs}g</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <p className="text-emerald-600 text-xs font-bold uppercase mb-1 tracking-wider">Protein</p>
                      <p className="text-lg font-black text-emerald-600">{scanResult.protein}g</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                      <p className="text-amber-600 text-xs font-bold uppercase mb-1 tracking-wider">Fat</p>
                      <p className="text-lg font-black text-amber-600">{scanResult.fat}g</p>
                    </div>
                 </div>

                 {/* Action Button */}
                 <button className="w-full py-4 text-center rounded-2xl font-bold text-lg text-white bg-gray-900 hover:bg-black transition-colors mb-4">
                   Lưu vào Nhật Ký Ăn Uống
                 </button>
                 <button 
                  onClick={() => setScanResult(null)}
                  className="w-full py-3 text-center rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                 >
                   Quét Món Khác
                 </button>
              </motion.div>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                 <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Camera size={40} className="text-gray-300" />
                 </div>
                 <p className="font-medium text-gray-500">Chưa có kết quả quét nào</p>
                 <p className="text-sm mt-2">Bấm chụp ảnh hoặc tải hình ảnh có sẵn từ máy tính để AI tự động trích xuất thông tin calo và dinh dưỡng.</p>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default ScanPage;
