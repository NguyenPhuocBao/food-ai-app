import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFoodById, deleteFood } from '../../services/admin.service';
import { ArrowLeft, Edit, Trash, Star, Clock, Flame, Award, Eye, Heart, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const AdminFoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const data = await getFoodById(Number(id));
        setFood(data);
      } catch (error) {
        toast.error('Không thể tải chi tiết món ăn');
        navigate('/admin/foods');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id, navigate]);

  const handleDelete = async () => {
    await deleteFood(Number(id));
    toast.success('Đã xóa món ăn');
    navigate('/admin/foods');
  };

  if (loading) return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  if (!food) return <div className="text-center py-12">Không tìm thấy món ăn</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/foods')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{food.name}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/admin/foods/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition">
            <Edit size={18} /> Chỉnh sửa
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition">
            <Trash size={18} /> Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Image + basic info */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
            <img src={food.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} alt={food.name} className="w-full h-64 object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center">
              <Flame className="mx-auto text-orange-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{food.calories}</p>
              <p className="text-sm text-gray-500">Calo</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center">
              <Award className="mx-auto text-blue-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{food.protein}g</p>
              <p className="text-sm text-gray-500">Protein</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center">
              <Award className="mx-auto text-yellow-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{food.fat}g</p>
              <p className="text-sm text-gray-500">Fat</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center">
              <Award className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{food.carbs}g</p>
              <p className="text-sm text-gray-500">Carbs</p>
            </div>
          </div>
        </div>

        {/* Right column: details, recipe, reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"><Clock size={20} /></div>
              <div><p className="text-sm text-gray-500">Danh mục</p><p className="font-medium">{food.category}</p></div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full"><Star size={20} /></div>
              <div><p className="text-sm text-gray-500">Đánh giá</p><p className="font-medium">{food.avgRating || 0} ⭐ ({food.reviewCount || 0})</p></div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full"><Eye size={20} /></div>
              <div><p className="text-sm text-gray-500">Lượt xem</p><p className="font-medium">{food.viewCount || 0}</p></div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full"><Heart size={20} /></div>
              <div><p className="text-sm text-gray-500">Yêu thích</p><p className="font-medium">{food.popularity || 0}</p></div>
            </div>
          </div>

          {/* Recipe */}
          {food.recipe && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">🍳 Công thức nấu ăn</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{food.recipe.title}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div><span className="text-sm text-gray-500">Chuẩn bị:</span> {food.recipe.prepTime} phút</div>
                <div><span className="text-sm text-gray-500">Nấu:</span> {food.recipe.cookTime} phút</div>
                <div><span className="text-sm text-gray-500">Khẩu phần:</span> {food.recipe.servings}</div>
                <div><span className="text-sm text-gray-500">Độ khó:</span> {food.recipe.difficulty}</div>
              </div>
              {food.recipe.tips && <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-2xl mb-4">💡 {food.recipe.tips}</div>}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Nguyên liệu:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {food.recipe.ingredients?.map((ing: any, idx: number) => (
                    <li key={idx}>{ing.name} - {ing.amount} {ing.unit} {ing.notes && `(${ing.notes})`}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Cách chế biến:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {food.recipe.steps?.map((step: any, idx: number) => (
                    <li key={idx}>{step.description} {step.timer && `⏰ ${step.timer/60} phút`}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Đánh giá từ người dùng</h2>
            {food.reviews?.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            ) : (
              <div className="space-y-4">
                {food.reviews?.slice(0,5).map((review: any) => (
                  <div key={review.id} className="border-b pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.user?.name}</span>
                      <div className="flex text-yellow-400">{"⭐".repeat(review.rating)}</div>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Xóa món ăn"
        message={`Bạn có chắc chắn muốn xóa món ăn "${food.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
      />
    </div>
  );
};

export default AdminFoodDetail;