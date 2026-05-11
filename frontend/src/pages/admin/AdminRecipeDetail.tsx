import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, Users, Utensils } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

const AdminRecipeDetail = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await api.get(`/admin/foods/${foodId}`);
        setFood(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    if (foodId) fetchFood();
  }, [foodId]);

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  if (!food) {
    return (
      <EmptyState
        icon={Utensils}
        title="Không tìm thấy"
        description="Món ăn không tồn tại."
      />
    );
  }

  const recipe = food.recipe;
  if (!recipe) {
    return (
      <div className="p-6 text-center">
        <p>Chưa có công thức cho món này.</p>
        <button
          onClick={() => navigate(`/admin/recipes/${foodId}/edit`)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-2xl"
        >
          Thêm công thức
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/foods/${foodId}`)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Công thức: {food.name}</h1>
        </div>
        <button
          onClick={() => navigate(`/admin/recipes/${foodId}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl"
        >
          <Edit size={18} /> Chỉnh sửa
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{recipe.summary}</p>

        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-1">
            <Clock size={16} /> {recipe.prepTime + recipe.cookTime} phút
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} /> {recipe.servings} phần
          </div>
          <div className="flex items-center gap-1">
            <span className="capitalize">Độ khó: {recipe.difficulty}</span>
          </div>
        </div>

        {recipe.tips && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl mb-4">
            <strong>💡 Mẹo:</strong> {recipe.tips}
          </div>
        )}
        {recipe.nutritionNotes && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mb-4">
            <strong>🥗 Lưu ý dinh dưỡng:</strong> {recipe.nutritionNotes}
          </div>
        )}

        <h3 className="text-lg font-semibold mt-6 mb-3">📝 Nguyên liệu</h3>
        <ul className="list-disc pl-5 space-y-1">
          {recipe.ingredients?.map((ing: any, idx: number) => (
            <li key={idx}>
              {ing.name}: {ing.amount} {ing.unit}{' '}
              {ing.notes && `(${ing.notes})`}
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">👨‍🍳 Các bước thực hiện</h3>
        <div className="space-y-4">
          {recipe.steps?.map((step: any) => (
            <div key={step.id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                {step.stepNumber}
              </div>
              <div>
                <p>{step.description}</p>
                {step.timer && (
                  <p className="text-sm text-gray-500">
                    ⏱️ {Math.floor(step.timer / 60)} phút
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {recipe.tools?.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mt-6 mb-3">🔧 Dụng cụ</h3>
            <ul className="list-disc pl-5">
              {recipe.tools.map((tool: any, idx: number) => (
                <li key={idx}>
                  {tool.name} {tool.isRequired ? '(cần thiết)' : '(tùy chọn)'}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRecipeDetail;
