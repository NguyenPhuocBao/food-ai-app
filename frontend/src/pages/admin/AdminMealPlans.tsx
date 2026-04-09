import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatAdminDate } from '../../utils/adminDateTime';

const AdminMealPlans = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    details: [] as any[],
  });
  const [foods, setFoods] = useState<any[]>([]);

  useEffect(() => {
    fetchPlans();
    fetchFoods();
  }, [userId]);

  const fetchPlans = async () => {
    try {
      const res = await api.get(`/admin/users/${userId}/meal-plans`);
      setPlans(res.data.data);
    } catch (error) {
      toast.error('Không thể tải kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await api.get('/foods?limit=100');
      setFoods(res.data.data);
    } catch (error) {}
  };

  const handleDelete = async (id: number) => {
    if (confirm('Xóa kế hoạch này?')) {
      await api.delete(`/admin/meal-plans/${id}`);
      toast.success('Đã xóa');
      fetchPlans();
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      startDate: plan.startDate.slice(0, 10),
      endDate: plan.endDate.slice(0, 10),
      details: plan.details.map((d: any) => ({
        foodId: d.foodId,
        mealType: d.mealType,
        dayOfWeek: d.dayOfWeek,
        quantity: d.quantity,
      })),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/admin/meal-plans/${editingPlan.id}`, {
          ...formData,
          userId,
        });
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/admin/meal-plans', {
          ...formData,
          userId,
        });
        toast.success('Tạo kế hoạch thành công');
      }
      setShowForm(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        { foodId: '', mealType: 'BREAKFAST', dayOfWeek: 0, quantity: 1 },
      ],
    });
  };

  const updateDetail = (idx: number, field: string, value: any) => {
    const newDetails = [...formData.details];
    newDetails[idx][field] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const removeDetail = (idx: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== idx),
    });
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/admin/users/${userId}`)} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Kế hoạch bữa ăn</h1>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setFormData({ name: '', startDate: '', endDate: '', details: [] });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl"
        >
          <Plus size={18} /> Tạo kế hoạch
        </button>
      </div>

      {/* Danh sách kế hoạch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {formatAdminDate(plan.startDate)} - {formatAdminDate(plan.endDate)}
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-slate-300">Trạng thái: {plan.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(plan)} className="text-blue-600">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">Chi tiết:</span>
              <ul className="list-disc pl-5">
                {plan.details.slice(0, 3).map((d: any, idx: number) => (
                  <li key={idx}>
                    Ngày {d.dayOfWeek + 1}: {d.food?.name} ({d.mealType}) - {d.quantity} phần
                  </li>
                ))}
                {plan.details.length > 3 && <li>... và {plan.details.length - 3} món khác</li>}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Modal tạo/sửa kế hoạch */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingPlan ? 'Sửa kế hoạch' : 'Tạo kế hoạch mới'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Tên kế hoạch</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-xl p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border rounded-xl p-2"
                    required
                  />
                </div>
                <div>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border rounded-xl p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Chi tiết bữa ăn</label>
                  <button type="button" onClick={addDetail} className="text-sm bg-green-600 text-white px-2 py-1 rounded-xl">
                    + Thêm món
                  </button>
                </div>
                {formData.details.map((detail, idx) => (
                  <div key={idx} className="border p-3 rounded-xl mb-2 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={detail.foodId}
                        onChange={(e) => updateDetail(idx, 'foodId', parseInt(e.target.value))}
                        className="flex-1 border rounded p-1"
                        required
                      >
                        <option value="">Chọn món ăn</option>
                        {foods.map((food) => (
                          <option key={food.id} value={food.id}>
                            {food.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={detail.mealType}
                        onChange={(e) => updateDetail(idx, 'mealType', e.target.value)}
                        className="w-32 border rounded p-1"
                      >
                        <option value="BREAKFAST">Sáng</option>
                        <option value="LUNCH">Trưa</option>
                        <option value="DINNER">Tối</option>
                        <option value="SNACK">Vặt</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={detail.dayOfWeek}
                        onChange={(e) => updateDetail(idx, 'dayOfWeek', parseInt(e.target.value))}
                        className="w-32 border rounded p-1"
                      >
                        {[0,1,2,3,4,5,6].map((d) => (
                          <option key={d} value={d}>
                            {['CN','T2','T3','T4','T5','T6','T7'][d]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Số phần"
                        value={detail.quantity}
                        onChange={(e) => updateDetail(idx, 'quantity', parseFloat(e.target.value))}
                        className="w-24 border rounded p-1"
                        step="0.5"
                      />
                      <button type="button" onClick={() => removeDetail(idx)} className="text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-xl">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                  {editingPlan ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMealPlans;
