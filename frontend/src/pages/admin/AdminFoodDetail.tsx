import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Clock, Users, Star, BookOpen, Save, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';
import ImageUpload from '../../components/admin/ImageUpload';

const AdminFoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<any>(null);
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
  });

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const res = await api.get(`/foods/${id}`);
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
      navigate('/admin/foods');
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
          <button onClick={() => navigate('/admin/foods')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{food.name}</h1>
        </div>
        <div className="flex gap-2">
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