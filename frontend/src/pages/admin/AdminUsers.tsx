import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, deleteUser, toggleUserBan, resetUserPassword, updateUserProfileByAdmin } from '../../services/admin.service';
import { Search, Edit, Trash, Lock, Unlock, Key, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';
import { useNavigate } from 'react-router-dom';
const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ height: '', weight: '', targetCalories: '', targetProtein: '', targetFat: '', targetCarbs: '', allergies: '' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(page, 20, search);
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải user'); } finally { setLoading(false); }
  };
  useEffect(() => { loadUsers(); }, [page, search]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const handleRoleChange = async (userId: number, role: string) => { await updateUserRole(userId, role); toast.success('Cập nhật vai trò'); loadUsers(); };
  const handleBan = async (userId: number, isActive: boolean) => { if (confirm(isActive ? 'Khóa?' : 'Mở khóa?')) { await toggleUserBan(userId); toast.success(isActive ? 'Đã khóa' : 'Đã mở khóa'); loadUsers(); } };
  const handleResetPassword = async (userId: number) => { if (confirm('Reset pass thành 123456?')) { await resetUserPassword(userId); toast.success('Reset pass thành công'); } };
  const handleDelete = async (userId: number) => { if (confirm('Xóa vĩnh viễn?')) { await deleteUser(userId); toast.success('Đã xóa'); loadUsers(); } };
  const openEditModal = (user: any) => { setEditingUser(user); setEditForm({ height: user.profile?.height?.toString() || '', weight: user.profile?.weight?.toString() || '', targetCalories: user.profile?.targetCalories?.toString() || '', targetProtein: user.profile?.targetProtein?.toString() || '', targetFat: user.profile?.targetFat?.toString() || '', targetCarbs: user.profile?.targetCarbs?.toString() || '', allergies: user.profile?.allergies?.join(', ') || '' }); };
  const handleEditSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!editingUser) return; await updateUserProfileByAdmin(editingUser.id, { height: parseFloat(editForm.height) || null, weight: parseFloat(editForm.weight) || null, targetCalories: parseInt(editForm.targetCalories) || null, targetProtein: parseFloat(editForm.targetProtein) || null, targetFat: parseFloat(editForm.targetFat) || null, targetCarbs: parseFloat(editForm.targetCarbs) || null, allergies: editForm.allergies.split(',').map(s => s.trim()) }); toast.success('Cập nhật sức khỏe'); setEditingUser(null); loadUsers(); };

  if (loading && page===1) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  if (!loading && users.length === 0) {
    return <EmptyState icon={Users} title="Không có người dùng" description="Chưa có tài khoản nào trong hệ thống." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Quản lý người dùng</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý tài khoản, phân quyền và sức khỏe</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
          />
        </div>
        <button onClick={handleSearch} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all">
          Tìm kiếm
        </button>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-left">Tên</th><th className="px-6 py-4 text-left">Email</th><th className="px-6 py-4 text-left">Vai trò</th><th className="px-6 py-4 text-left">Trạng thái</th><th className="px-6 py-4 text-left">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.id}</td>
                 
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <button onClick={() => navigate(`/admin/users/${user.id}`)} className="hover:text-blue-600 hover:underline cursor-pointer">
                      {user.name}
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800">
                      <option>USER</option><option>MODERATOR</option><option>ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleBan(user.id, user.isActive)} className="text-yellow-600 hover:text-yellow-800 transition" title="Khóa/Mở khóa">
                        {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button onClick={() => handleResetPassword(user.id)} className="text-blue-600 hover:text-blue-800 transition" title="Reset mật khẩu">
                        <Key size={18} />
                      </button>
                      <button onClick={() => openEditModal(user)} className="text-green-600 hover:text-green-800 transition" title="Sửa sức khỏe">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 transition" title="Xóa">
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">← Trước</button>
        <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">Sau →</button>
      </div>

      {/* Modal chỉnh sửa profile (giữ nguyên style cũ nhưng bo tròn hơn) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa hồ sơ sức khỏe</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="number" placeholder="Chiều cao (cm)" value={editForm.height} onChange={e=>setEditForm({...editForm,height:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <input type="number" placeholder="Cân nặng (kg)" value={editForm.weight} onChange={e=>setEditForm({...editForm,weight:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <input type="number" placeholder="Calo mục tiêu" value={editForm.targetCalories} onChange={e=>setEditForm({...editForm,targetCalories:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <input type="number" step="0.1" placeholder="Protein (g)" value={editForm.targetProtein} onChange={e=>setEditForm({...editForm,targetProtein:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <input type="number" step="0.1" placeholder="Fat (g)" value={editForm.targetFat} onChange={e=>setEditForm({...editForm,targetFat:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <input type="number" step="0.1" placeholder="Carbs (g)" value={editForm.targetCarbs} onChange={e=>setEditForm({...editForm,targetCarbs:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <input type="text" placeholder="Dị ứng (cách nhau bằng dấu phẩy)" value={editForm.allergies} onChange={e=>setEditForm({...editForm,allergies:e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800" />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg transition">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;