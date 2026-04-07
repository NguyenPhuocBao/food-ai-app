import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';
import ImageUpload from '../../components/admin/ImageUpload';

const AdminFoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await api.get(`/foods/${id}`);
        setFood(res.data.data);
      } catch (error) {
        toast.error('Không thể tải thông tin món ăn');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  if (loading) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  if (!food) {
    return <EmptyState icon={ArrowLeft} title="Không tìm thấy món ăn" description="Món ăn không tồn tại hoặc đã bị xóa." />;
  }

  const recipe = food.recipe;
  const avgRating = food.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (food.reviews?.length || 1) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/foods')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{food.name}</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-2xl hover:bg-blue-200 transition">
            <Edit size={18} /> Sửa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-2xl hover:bg-red-200 transition">
            <Trash2 size={18} /> Xóa
          </button>
        </div>
      </div>

      {/* Thông tin cơ bản + Upload ảnh */}
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin dinh dưỡng</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Calo</span><span className="font-medium">{food.calories} kcal</span></div>
              <div className="flex justify-between"><span>Đạm</span><span>{food.protein} g</span></div>
              <div className="flex justify-between"><span>Béo</span><span>{food.fat} g</span></div>
              <div className="flex justify-between"><span>Bột đường</span><span>{food.carbs} g</span></div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin khác</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Danh mục</span><span>{food.category}</span></div>
              <div className="flex justify-between"><span>Độ khó</span><span>{recipe?.difficulty || 'Chưa có'}</span></div>
              <div className="flex justify-between"><span>Thời gian nấu</span><span>{recipe?.totalTime || '?'} phút</span></div>
              <div className="flex justify-between"><span>Đánh giá</span><div className="flex items-center gap-1">{Array(5).fill(0).map((_, i) => <Star key={i} size={16} className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)} ({food.reviews?.length || 0})</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Nguyên liệu */}
      {recipe?.ingredients?.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Nguyên liệu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients.map((ing: any, idx: number) => (
              <div key={idx} className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
                <span>{ing.name}</span>
                <span className="text-gray-500">{ing.amount} {ing.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Các bước nấu */}
      {recipe?.steps?.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Cách chế biến</h2>
          <div className="space-y-4">
            {recipe.steps.map((step: any) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">{step.stepNumber}</div>
                <div>
                  <p>{step.description}</p>
                  {step.timer && <p className="text-sm text-gray-500 mt-1">⏱️ {Math.floor(step.timer / 60)} phút</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Đánh giá của người dùng */}
      {food.reviews?.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Đánh giá từ người dùng</h2>
          <div className="space-y-4">
            {food.reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)}</div>
                  <span className="text-sm text-gray-500">{review.user?.name}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodDetail;