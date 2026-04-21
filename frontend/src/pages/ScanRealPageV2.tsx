import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  History,
  Loader2,
  RefreshCcw,
  Search,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  analyzeFoodImage,
  confirmScanFood,
  getScanHistory,
  type ScanAnalyzeResult,
  type ScanFoodSuggestion,
  type ScanHistoryItem,
} from '../services/analyze.service';
import { addMeal } from '../services/meal.service';
import { getAssetUrl } from '../services/api';
import { searchFoods } from '../services/food.service';
import type { FoodItem, Meal } from '../types';

const MEAL_OPTIONS: Array<{ value: Meal['mealType']; label: string }> = [
  { value: 'BREAKFAST', label: 'Bữa sáng' },
  { value: 'LUNCH', label: 'Bữa trưa' },
  { value: 'DINNER', label: 'Bữa tối' },
  { value: 'SNACK', label: 'Bữa phụ' },
];

const mapFoodToSuggestion = (
  food: Pick<FoodItem, 'id' | 'name' | 'calories' | 'protein' | 'fat' | 'carbs' | 'imageUrl' | 'category'>,
): ScanFoodSuggestion => ({
  id: food.id,
  name: food.name,
  calories: food.calories,
  protein: food.protein,
  fat: food.fat,
  carbs: food.carbs,
  imageUrl: food.imageUrl,
  category: food.category,
});

const dedupeFoods = (foods: ScanFoodSuggestion[]) => {
  const map = new Map<number, ScanFoodSuggestion>();
  foods.forEach((food) => {
    if (!map.has(food.id)) map.set(food.id, food);
  });
  return Array.from(map.values());
};

const extractHistoryName = (item: ScanHistoryItem) =>
  item.result?.confirmed?.foodName ||
  item.result?.meta?.candidateNames?.[0] ||
  item.result?.prediction?.top_prediction?.class_name ||
  item.result?.prediction?.data?.food_name ||
  item.result?.top_prediction?.class_name ||
  item.result?.data?.food_name ||
  'Không xác định';

const ScanRealPageV2 = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchingFoods, setSearchingFoods] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanResult, setScanResult] = useState<ScanAnalyzeResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const [mealType, setMealType] = useState<Meal['mealType']>('DINNER');
  const [quantity, setQuantity] = useState(1);
  const [foodQuery, setFoodQuery] = useState('');
  const [suggestedFoods, setSuggestedFoods] = useState<ScanFoodSuggestion[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);

  const selectedFood = useMemo(
    () => suggestedFoods.find((food) => food.id === selectedFoodId) || null,
    [suggestedFoods, selectedFoodId],
  );

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

  useEffect(() => {
    if (!scanResult) {
      setSuggestedFoods([]);
      setSelectedFoodId(null);
      return;
    }

    const initialFoods = dedupeFoods([
      ...(scanResult.foodItem ? [scanResult.foodItem] : []),
      ...(scanResult.suggestions || []),
    ]);
    setSuggestedFoods(initialFoods);
    setSelectedFoodId(initialFoods[0]?.id ?? null);
    setFoodQuery(scanResult.foodName || '');
  }, [scanResult]);

  useEffect(() => {
    if (!scanResult) return;

    const keyword = foodQuery.trim();
    if (keyword.length < 2) return;

    const timer = setTimeout(async () => {
      setSearchingFoods(true);
      try {
        const result = await searchFoods(keyword);
        const extra = result.slice(0, 8).map(mapFoodToSuggestion);
        setSuggestedFoods((prev) => dedupeFoods([...prev, ...extra]));
      } finally {
        setSearchingFoods(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [foodQuery, scanResult]);

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
      toast.error(error?.response?.data?.error || 'Không thềEphân tích ảnh');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setScanResult(null);
    setMealType('DINNER');
    setQuantity(1);
    setFoodQuery('');
    setSuggestedFoods([]);
    setSelectedFoodId(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSaveMeal = async () => {
    if (!scanResult || !selectedFood) return;

    setSavingMeal(true);
    try {
      await confirmScanFood(scanResult.scanId, selectedFood.id).catch(() => null);
      await addMeal(selectedFood.id, mealType, quantity);
      toast.success('Đã lưu món ăn vào nhật ký');
      await loadHistory();
    } catch {
      toast.error('Không thềElưu món ăn vào nhật ký');
    } finally {
      setSavingMeal(false);
    }
  };

  const displayImage =
    previewUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Camera size={28} className="text-emerald-500" /> Scan món ăn bằng AI
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Tải ảnh món ăn đềEAI nhận diện, sau đó chọn món phù hợp và lưu vào nhật ký bữa ăn.
        </p>
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
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-3xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-3xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-3xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-3xl" />

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
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-100">
                      <CheckCircle2 size={14} /> ĐềEtin cậy {Math.round(scanResult.confidence)}%
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{scanResult.foodName}</h2>
                  </div>
                </div>

                {!!scanResult?.prediction?.meta?.aiError && (
                  <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 p-3 text-amber-800 text-sm">
                    Không kết nối được AI service. Bạn vẫn có thềEchọn món thủ công bên dưới.
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tìm món trong database</label>
                  <div className="relative mt-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={foodQuery}
                      onChange={(event) => setFoodQuery(event.target.value)}
                      placeholder="Nhập tên món ăn..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                    />
                    {searchingFoods && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
                  {suggestedFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFoodId(food.id)}
                      className={`w-full text-left border rounded-xl p-3 transition ${
                        selectedFoodId === food.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{food.name}</p>
                      <p className="text-xs text-gray-500">{food.calories} kcal</p>
                    </button>
                  ))}
                </div>

                {selectedFood ? (
                  <>
                    <div className="bg-emerald-600 text-white rounded-[24px] p-5 shadow-lg shadow-emerald-500/20 mb-4 flex justify-between items-center">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Tổng năng lượng</p>
                        <p className="text-4xl font-black">
                          {selectedFood.calories} <span className="text-xl font-medium text-emerald-200">kcal</span>
                        </p>
                      </div>
                      <Zap size={40} className="text-amber-300 opacity-80" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                        <p className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-wider">Carbs</p>
                        <p className="text-lg font-black text-gray-900">{Math.round(selectedFood.carbs)}g</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                        <p className="text-emerald-600 text-xs font-bold uppercase mb-1 tracking-wider">Protein</p>
                        <p className="text-lg font-black text-emerald-600">{Math.round(selectedFood.protein)}g</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                        <p className="text-amber-600 text-xs font-bold uppercase mb-1 tracking-wider">Fat</p>
                        <p className="text-lg font-black text-amber-600">{Math.round(selectedFood.fat)}g</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại bữa</label>
                        <select
                          value={mealType}
                          onChange={(event) => setMealType(event.target.value as Meal['mealType'])}
                          className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        >
                          {MEAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SềElượng</label>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={quantity}
                          onChange={(event) => setQuantity(Math.max(0.1, Number(event.target.value) || 1))}
                          className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveMeal}
                      disabled={savingMeal}
                      className="w-full py-4 text-center rounded-2xl font-bold text-lg text-white bg-gray-900 hover:bg-black transition-colors mb-3 disabled:opacity-70"
                    >
                      {savingMeal ? 'Đang lưu...' : 'Lưu vào nhật ký ăn uống'}
                    </button>
                  </>
                ) : (
                  <div className="rounded-[24px] bg-amber-50 border border-amber-100 p-5 text-amber-800 text-sm leading-relaxed mb-4">
                    Chưa tìm thấy món phù hợp. Hãy nhập tên món và chọn từ danh sách đềElưu.
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-3 text-center rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Scan món khác
                </button>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <Camera size={40} className="text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">{isScanning ? 'Đang phân tích ảnh...' : 'Chưa có kết quả scan'}</p>
                <p className="text-sm mt-2">
                  Chọn ảnh món ăn đềEAI nhận diện và gửi đủ thông tin dinh dưỡng.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History size={18} className="text-gray-500" />
              <h3 className="font-black text-gray-900">Lịch sử scan gần đây</h3>
            </div>

            {loadingHistory ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400">Bạn chưa có lượt scan nào.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => {
                  const historyFoodName = extractHistoryName(item);
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
                          {Math.round(item.confidence)}% ? {new Date(item.createdAt).toLocaleString('vi-VN')}
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

export default ScanRealPageV2;

