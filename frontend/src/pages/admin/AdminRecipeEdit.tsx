import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminRecipeEdit = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(2);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [tips, setTips] = useState('');
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    fetchRecipe();
  }, [foodId]);

  const fetchRecipe = async () => {
    try {
      const res = await api.get(`/foods/${foodId}`);
      const food = res.data.data;
      if (food.recipe) {
        setRecipe(food.recipe);
        setTitle(food.recipe.title || '');
        setSummary(food.recipe.summary || '');
        setPrepTime(food.recipe.prepTime || 0);
        setCookTime(food.recipe.cookTime || 0);
        setServings(food.recipe.servings || 2);
        setDifficulty(food.recipe.difficulty || 'MEDIUM');
        setTips(food.recipe.tips || '');
        setNutritionNotes(food.recipe.nutritionNotes || '');
        setIngredients(food.recipe.ingredients || []);
        setSteps(food.recipe.steps || []);
        setTools(food.recipe.tools || []);
      } else {
        setIngredients([{ name: '', amount: 0, unit: 'g', notes: '', order: 1 }]);
        setSteps([{ stepNumber: 1, description: '', timer: null, order: 1 }]);
        setTools([]);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', amount: 0, unit: 'g', notes: '', order: ingredients.length + 1 },
    ]);
  };
  const updateIngredient = (idx: number, field: string, value: any) => {
    const updated = [...ingredients];
    updated[idx][field] = value;
    setIngredients(updated);
  };
  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, description: '', timer: null, order: steps.length + 1 },
    ]);
  };
  const updateStep = (idx: number, field: string, value: any) => {
    const updated = [...steps];
    updated[idx][field] = value;
    setSteps(updated);
  };
  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const addTool = () => {
    setTools([...tools, { name: '', isRequired: true }]);
  };
  const updateTool = (idx: number, field: string, value: any) => {
    const updated = [...tools];
    updated[idx][field] = value;
    setTools(updated);
  };
  const removeTool = (idx: number) => {
    setTools(tools.filter((_, i) => i !== idx));
  };

 const handleSave = async () => {
  setSaving(true);
  try {
    // Loại bỏ các trường id, recipeId khỏi mảng con
    const ingredientsCreate = ingredients.map(({ id, recipeId, ...rest }) => rest);
    const stepsCreate = steps.map(({ id, recipeId, ...rest }) => rest);
    const toolsCreate = tools.map(({ id, recipeId, ...rest }) => rest);

    const recipeData = {
      title,
      summary,
      prepTime,
      cookTime,
      totalTime: prepTime + cookTime,
      servings,
      difficulty,
      tips,
      nutritionNotes,
      ingredients: {
        deleteMany: {},
        create: ingredientsCreate,
      },
      steps: {
        deleteMany: {},
        create: stepsCreate,
      },
      tools: {
        deleteMany: {},
        create: toolsCreate,
      },
    };
    if (recipe) {
      await api.put(`/admin/recipes/${recipe.id}`, recipeData);
    } else {
      await api.post('/admin/recipes', { foodId: parseInt(foodId!), ...recipeData });
    }
    toast.success('Lưu công thức thành công');
    navigate(`/admin/recipes/${foodId}`);
  } catch (error) {
    console.error(error);
    toast.error('Lưu thất bại');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/recipes/${foodId}`)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Chỉnh sửa công thức</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Thông tin chung</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-xl p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Mô tả ngắn</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full border rounded-xl p-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>Chuẩn bị (phút)</label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="w-full border rounded-xl p-2"
                />
              </div>
              <div>
                <label>Nấu (phút)</label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(Number(e.target.value))}
                  className="w-full border rounded-xl p-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>Khẩu phần</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full border rounded-xl p-2"
                />
              </div>
              <div>
                <label>Độ khó</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border rounded-xl p-2"
                >
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>
            </div>
            <div>
              <label>Mẹo nấu</label>
              <textarea
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                rows={2}
                className="w-full border rounded-xl p-2"
              />
            </div>
            <div>
              <label>Ghi chú dinh dưỡng</label>
              <textarea
                value={nutritionNotes}
                onChange={(e) => setNutritionNotes(e.target.value)}
                rows={2}
                className="w-full border rounded-xl p-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Nguyên liệu</h2>
            <button
              onClick={addIngredient}
              className="text-sm bg-green-600 text-white px-2 py-1 rounded-xl"
            >
              + Thêm
            </button>
          </div>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input
                placeholder="Tên"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                className="flex-1 border rounded p-1"
              />
              <input
                type="number"
                placeholder="SL"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value))}
                className="w-20 border rounded p-1"
              />
              <input
                placeholder="Đơn vị"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                className="w-24 border rounded p-1"
              />
              <button onClick={() => removeIngredient(idx)} className="text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Các bước</h2>
          <button onClick={addStep} className="text-sm bg-green-600 text-white px-2 py-1 rounded-xl">
            + Thêm bước
          </button>
        </div>
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-2 mb-3">
            <span className="font-bold w-8">{step.stepNumber}</span>
            <textarea
              placeholder="Mô tả"
              value={step.description}
              onChange={(e) => updateStep(idx, 'description', e.target.value)}
              className="flex-1 border rounded p-1"
              rows={2}
            />
            <input
              type="number"
              placeholder="Timer (s)"
              value={step.timer || ''}
              onChange={(e) =>
                updateStep(idx, 'timer', e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-28 border rounded p-1"
            />
            <button onClick={() => removeStep(idx)} className="text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Dụng cụ</h2>
          <button onClick={addTool} className="text-sm bg-green-600 text-white px-2 py-1 rounded-xl">
            + Thêm
          </button>
        </div>
        {tools.map((tool, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <input
              placeholder="Tên dụng cụ"
              value={tool.name}
              onChange={(e) => updateTool(idx, 'name', e.target.value)}
              className="flex-1 border rounded p-1"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={tool.isRequired}
                onChange={(e) => updateTool(idx, 'isRequired', e.target.checked)}
              />{' '}
              Cần thiết
            </label>
            <button onClick={() => removeTool(idx)} className="text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRecipeEdit;