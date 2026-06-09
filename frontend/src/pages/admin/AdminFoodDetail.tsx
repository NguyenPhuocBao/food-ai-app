import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Edit, Trash2, Star, BookOpen, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';
import ImageUpload from '../../components/admin/ImageUpload';

const MEAL_TIME_OPTIONS = [
  { value: 'BREAKFAST', label: 'Bữa sáng' },
  { value: 'LUNCH', label: 'Bữa trưa' },
  { value: 'DINNER', label: 'Bữa tối' },
  { value: 'SNACK', label: 'Ăn nhẹ' },
];
const MEAL_ROLE_OPTIONS = [
  { value: 'MAIN', label: 'Món chính' },
  { value: 'STAPLE', label: 'Tinh bột' },
  { value: 'SIDE', label: 'Món phụ/rau' },
  { value: 'SOUP', label: 'Canh/súp' },
  { value: 'DESSERT', label: 'Tráng miệng' },
  { value: 'DRINK', label: 'Đồ uống' },
  { value: 'SNACK', label: 'Ăn nhẹ' },
];
const GOAL_TAG_OPTIONS = [
  { value: 'WEIGHT_LOSS', label: 'Giảm cân' },
  { value: 'MAINTENANCE', label: 'Duy trì' },
  { value: 'WEIGHT_GAIN', label: 'Tăng cân' },
  { value: 'MUSCLE_GAIN', label: 'Tăng cơ' },
];
const COOKING_METHOD_OPTIONS = ['', 'BOILED', 'STEAMED', 'GRILLED', 'STIR_FRIED', 'FRIED', 'BRAISED', 'SOUP', 'RAW'];
const PORTION_TYPE_OPTIONS = ['', 'FULL_MEAL', 'COMPONENT', 'LIGHT'];

const AdminFoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const backToFromQuery = location.search ? `/admin/foods${location.search}` : '/admin/foods';
  const backTo = typeof from === 'string' && from.startsWith('/admin/foods') ? from : backToFromQuery;
  const [food, setFood] = useState<any>(null);
  const [foodNav, setFoodNav] = useState<{ prevId: number | null; nextId: number | null; position: number; total: number }>({
    prevId: null,
    nextId: null,
    position: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    description: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    mealTimeTags: [] as string[],
    mealRoles: [] as string[],
    goalTags: [] as string[],
    cookingMethod: '',
    portionType: '',
  });

  const toggleArrayValue = (field: 'mealTimeTags' | 'mealRoles' | 'goalTags', value: string) => {
    setEditForm((current) => {
      const exists = current[field].includes(value);
      return {
        ...current,
        [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value],
      };
    });
  };

  useEffect(() => {
    fetchFood();
  }, [id]);

  useEffect(() => {
    const loadFoodNavigation = async () => {
      try {
        const res = await api.get('/admin/foods?limit=1000');
        const foods = (res.data.data || []).sort((a: any, b: any) => a.id - b.id);
        const currentId = Number(id);
        const currentIndex = foods.findIndex((item: any) => item.id === currentId);
        setFoodNav({
          prevId: currentIndex > 0 ? foods[currentIndex - 1].id : null,
          nextId: currentIndex >= 0 && currentIndex < foods.length - 1 ? foods[currentIndex + 1].id : null,
          position: currentIndex >= 0 ? currentIndex + 1 : 0,
          total: foods.length,
        });
      } catch {
        setFoodNav({ prevId: null, nextId: null, position: 0, total: 0 });
      }
    };

    void loadFoodNavigation();
  }, [id]);

  const goToFood = (foodId: number | null) => {
    if (!foodId) return;
    navigate(`/admin/foods/${foodId}${location.search}`, {
      state: { from: backTo },
    });
  };

  const fetchFood = async () => {
    try {
      const res = await api.get(`/admin/foods/${id}`);
      setFood(res.data.data);
      setEditForm({
        name: res.data.data.name,
        category: res.data.data.category,
        description: res.data.data.description || '',
        calories: res.data.data.calories,
        protein: res.data.data.protein,
        fat: res.data.data.fat,
        carbs: res.data.data.carbs,
        isVegetarian: res.data.data.isVegetarian,
        isVegan: res.data.data.isVegan,
        isGlutenFree: res.data.data.isGlutenFree,
        mealTimeTags: res.data.data.mealTimeTags || [],
        mealRoles: res.data.data.mealRoles || [],
        goalTags: res.data.data.goalTags || [],
        cookingMethod: res.data.data.cookingMethod || '',
        portionType: res.data.data.portionType || '',
      });
    } catch (error) {
      toast.error('Không thể tải thông tin món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/admin/foods/${id}`, editForm);
      toast.success('Cập nhật thành công');
      setShowEditModal(false);
      fetchFood(); // refresh
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDeleteFood = async () => {
    if (confirm('Xóa món ăn này? Hành động không thể hoàn tác.')) {
      await api.delete(`/admin/foods/${id}`);
      toast.success('Đã xóa món ăn');
      navigate(backTo);
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!food) return <EmptyState icon={ArrowLeft} title="Không tìm thấy" description="Món ăn không tồn tại." />;

  const recipe = food.recipe;
  const avgRating = food.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (food.reviews?.length || 1) || 0;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(backTo)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{food.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goToFood(foodNav.prevId)}
            disabled={!foodNav.prevId}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100"
          >
            <ArrowLeft size={18} /> Trước
          </button>
          <div className="hidden items-center rounded-2xl bg-gray-50 px-3 py-2 text-sm font-bold text-gray-500 md:flex">
            {foodNav.position || '-'} / {foodNav.total || '-'}
          </div>
          <button
            onClick={() => goToFood(foodNav.nextId)}
            disabled={!foodNav.nextId}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100"
          >
            Sau <ArrowRight size={18} />
          </button>
          <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700">
            <Edit size={18} /> Sửa thông tin
          </button>
          <button onClick={() => navigate(`/admin/recipes/${food.id}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">
            <BookOpen size={18} /> Sửa công thức
          </button>
          <button onClick={handleDeleteFood} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700">
            <Trash2 size={18} /> Xóa
          </button>
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <ImageUpload
            key={food.id}
            foodId={food.id}
            currentImage={food.imageUrl}
            onUploadSuccess={(url) => setFood({ ...food, imageUrl: url })}
          />
          <p className="text-gray-600 dark:text-gray-300 mt-4">{food.description}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Dinh dưỡng</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Calo</span><span className="font-bold">{food.calories} kcal</span></div>
              <div className="flex justify-between"><span>Đạm</span><span>{food.protein} g</span></div>
              <div className="flex justify-between"><span>Béo</span><span>{food.fat} g</span></div>
              <div className="flex justify-between"><span>Bột đường</span><span>{food.carbs} g</span></div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin khác</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Danh mục</span><span>{food.category}</span></div>
              <div className="flex justify-between gap-4"><span>Bữa phù hợp</span><span className="text-right">{food.mealTimeTags?.join(', ') || 'Chưa gán'}</span></div>
              <div className="flex justify-between gap-4"><span>Vai trò</span><span className="text-right">{food.mealRoles?.join(', ') || 'Chưa gán'}</span></div>
              <div className="flex justify-between gap-4"><span>Mục tiêu</span><span className="text-right">{food.goalTags?.join(', ') || 'Chưa gán'}</span></div>
              <div className="flex justify-between"><span>Chế biến</span><span>{food.cookingMethod || 'Chưa gán'}</span></div>
              <div className="flex justify-between"><span>Khẩu phần</span><span>{food.portionType || 'Chưa gán'}</span></div>
              <div className="flex justify-between"><span>Độ khó</span><span>{recipe?.difficulty || 'Chưa có'}</span></div>
              <div className="flex justify-between"><span>Thời gian nấu</span><span>{recipe?.totalTime || '?'} phút</span></div>
              <div className="flex justify-between"><span>Đánh giá</span><div className="flex items-center gap-1">{Array(5).fill(0).map((_, i) => <Star key={i} size={16} className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)} ({food.reviews?.length || 0})</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Chỉnh sửa món ăn</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateFood} className="p-4 space-y-4">
              <div><label>Tên món</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border rounded-xl p-2" required /></div>
              <div><label>Danh mục</label><input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border rounded-xl p-2" required /></div>
              <div><label>Mô tả</label><textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3} className="w-full border rounded-xl p-2" /></div>
              <div className="grid grid-cols-2 gap-2"><label>Calo</label><input type="number" value={editForm.calories} onChange={e => setEditForm({...editForm, calories: parseInt(e.target.value)})} className="border rounded-xl p-2" /></div>
              <div className="grid grid-cols-2 gap-2"><label>Protein (g)</label><input type="number" step="0.1" value={editForm.protein} onChange={e => setEditForm({...editForm, protein: parseFloat(e.target.value)})} className="border rounded-xl p-2" /></div>
              <div className="grid grid-cols-2 gap-2"><label>Fat (g)</label><input type="number" step="0.1" value={editForm.fat} onChange={e => setEditForm({...editForm, fat: parseFloat(e.target.value)})} className="border rounded-xl p-2" /></div>
              <div className="grid grid-cols-2 gap-2"><label>Carbs (g)</label><input type="number" step="0.1" value={editForm.carbs} onChange={e => setEditForm({...editForm, carbs: parseFloat(e.target.value)})} className="border rounded-xl p-2" /></div>
              <div>
                <label className="font-bold">Bữa phù hợp</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MEAL_TIME_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-xl border p-2 text-sm">
                      <input type="checkbox" checked={editForm.mealTimeTags.includes(option.value)} onChange={() => toggleArrayValue('mealTimeTags', option.value)} />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold">Vai trò trong bữa</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MEAL_ROLE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-xl border p-2 text-sm">
                      <input type="checkbox" checked={editForm.mealRoles.includes(option.value)} onChange={() => toggleArrayValue('mealRoles', option.value)} />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold">Mục tiêu phù hợp</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {GOAL_TAG_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-xl border p-2 text-sm">
                      <input type="checkbox" checked={editForm.goalTags.includes(option.value)} onChange={() => toggleArrayValue('goalTags', option.value)} />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div><label>Cách chế biến</label><select value={editForm.cookingMethod} onChange={e => setEditForm({...editForm, cookingMethod: e.target.value})} className="w-full border rounded-xl p-2">{COOKING_METHOD_OPTIONS.map((item) => <option key={item} value={item}>{item || 'Chưa gán'}</option>)}</select></div>
              <div><label>Kiểu khẩu phần</label><select value={editForm.portionType} onChange={e => setEditForm({...editForm, portionType: e.target.value})} className="w-full border rounded-xl p-2">{PORTION_TYPE_OPTIONS.map((item) => <option key={item} value={item}>{item || 'Chưa gán'}</option>)}</select></div>
              <div className="flex gap-4"><label className="flex items-center gap-1"><input type="checkbox" checked={editForm.isVegetarian} onChange={e => setEditForm({...editForm, isVegetarian: e.target.checked})} /> Chay</label><label className="flex items-center gap-1"><input type="checkbox" checked={editForm.isVegan} onChange={e => setEditForm({...editForm, isVegan: e.target.checked})} /> Thuần chay</label><label className="flex items-center gap-1"><input type="checkbox" checked={editForm.isGlutenFree} onChange={e => setEditForm({...editForm, isGlutenFree: e.target.checked})} /> Không gluten</label></div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodDetail;
