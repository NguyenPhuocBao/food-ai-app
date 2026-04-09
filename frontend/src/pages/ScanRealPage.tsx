import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, History, Loader2, RefreshCcw, UploadCloud, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { analyzeFoodImage, getScanHistory, type ScanAnalyzeResult, type ScanHistoryItem } from '../services/analyze.service';
import { addMeal } from '../services/meal.service';
import { getAssetUrl } from '../services/api';

const ScanRealPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanAnalyzeResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [savingMeal, setSavingMeal] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const scans = await getScanHistory();
      setHistory(scans);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setScanResult(null);
    setIsScanning(true);

    try {
      const result = await analyzeFoodImage(file);
      setScanResult(result);
      await loadHistory();
      toast.success('Đã phân tích ảnh thành công');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không thể phân tích ảnh');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setScanResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSaveMeal = async () => {
    if (!scanResult?.foodItem) return;

    setSavingMeal(true);
    try {
      await addMeal(scanResult.foodItem.id, 'DINNER', 1);
      toast.success('Đã lưu món ăn vào nhật ký');
    } catch {
      toast.error('Không thể lưu món ăn vào nhật ký');
    } finally {
      setSavingMeal(false);
    }
  };

  const displayImage = previewUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Camera size={28} className="text-emerald-500" /> Quét Món Ăn Bằng AI
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tải ảnh món ăn lên để AI nhận diện và gợi ý thông tin dinh dưỡng.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[640px]">
        <div className="lg:col-span-8 bg-black rounded-[32px] overflow-hidden relative shadow-lg h-full flex flex-col">
          <img src={displayImage} alt="Scan preview" className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />

          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 sm:w-96 sm:h-96 border-2 border-dashed border-white/50 rounded-3xl relative">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl"></div>

              {isScanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_20px_4px_#10B981] z-20"
                />
              )}
            </div>
          </div>

          <div className="relative z-20 mt-auto p-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-medium transition-colors flex items-center gap-2"
            >
              <UploadCloud size={20} /> Tải ảnh lên
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isScanning}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
            >
              {isScanning ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} />}
            </button>
            <button
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCcw size={20} /> Làm mới
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm flex flex-col min-h-[420px]">
            {scanResult ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-100">
                      <CheckCircle2 size={14} /> Độ tin cậy {Math.round(scanResult.confidence)}%
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{scanResult.foodName}</h2>
                  </div>
                </div>

                {scanResult.foodItem ? (
                  <>
                    <div className="bg-emerald-600 text-white rounded-[24px] p-5 shadow-lg shadow-emerald-500/20 mb-6 flex justify-between items-center">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Tổng năng lượng</p>
                        <p className="text-4xl font-black">
                          {scanResult.foodItem.calories} <span className="text-xl font-medium text-emerald-200">kcal</span>
                        </p>
                      </div>
                      <Zap size={40} className="text-amber-300 opacity-80" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-wider">Carbs</p>
                        <p className="text-lg font-black text-gray-900">{Math.round(scanResult.foodItem.carbs)}g</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                        <p className="text-emerald-600 text-xs font-bold uppercase mb-1 tracking-wider">Protein</p>
                        <p className="text-lg font-black text-emerald-600">{Math.round(scanResult.foodItem.protein)}g</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                        <p className="text-amber-600 text-xs font-bold uppercase mb-1 tracking-wider">Fat</p>
                        <p className="text-lg font-black text-amber-600">{Math.round(scanResult.foodItem.fat)}g</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveMeal}
                      disabled={savingMeal}
                      className="w-full py-4 text-center rounded-2xl font-bold text-lg text-white bg-gray-900 hover:bg-black transition-colors mb-4 disabled:opacity-70"
                    >
                      {savingMeal ? 'Đang lưu...' : 'Lưu vào nhật ký ăn uống'}
                    </button>
                  </>
                ) : (
                  <div className="rounded-[24px] bg-amber-50 border border-amber-100 p-5 text-amber-800 text-sm leading-relaxed">
                    AI đã nhận diện ảnh nhưng chưa khớp được với món ăn trong database. Bạn có thể thử ảnh khác hoặc bổ sung dữ liệu món này vào hệ thống.
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-3 text-center rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Quét món khác
                </button>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Camera size={40} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">{isScanning ? 'Đang phân tích ảnh...' : 'Chưa có kết quả quét nào'}</p>
                <p className="text-sm mt-2">
                  Chọn ảnh món ăn để AI nhận diện và liên kết với dữ liệu dinh dưỡng trong hệ thống.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History size={18} className="text-gray-500" />
              <h3 className="font-black text-gray-900">Lịch sử quét gần đây</h3>
            </div>

            {loadingHistory ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400">Bạn chưa có lượt quét nào.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => {
                  const historyFoodName = item.result?.data?.food_name || item.result?.top_prediction?.class_name || 'Không xác định';
                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                          <img src={getAssetUrl(item.imageUrl)} alt={historyFoodName} className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{historyFoodName}</p>
                        <p className="text-xs text-gray-400">
                          {Math.round(item.confidence)}% • {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanRealPage;
