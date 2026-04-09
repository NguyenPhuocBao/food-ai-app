import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash, Lock, Unlock, Key } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const res = await api.get('/admin/users?limit=1000');
        const users = res.data.data;
        users.sort((a: any, b: any) => a.id - b.id); // ID mới nhất lên đầu
        setAllUsers(users);
      } catch (error) {
        toast.error('Lỗi tải người dùng');
      } finally {
        setLoading(false);
      }
    };
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const normalizedSearch = removeAccents(searchInput.toLowerCase());
      const filtered = allUsers.filter((user) =>
        removeAccents(user.name.toLowerCase()).includes(normalizedSearch) ||
        removeAccents(user.email.toLowerCase()).includes(normalizedSearch)
      );
      setFilteredUsers(filtered);
    }
    setPage(1);
  }, [searchInput, allUsers]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleRoleChange = async (userId: number, role: string) => {
    await api.put(`/admin/users/${userId}/role`, { role });
    toast.success('Cập nhật vai trò');
    setAllUsers((prev) => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const handleBanToggle = async (userId: number, isActive: boolean) => {
    if (confirm(isActive ? 'Khóa tài khoản này?' : 'Mở khóa?')) {
      await api.put(`/admin/users/${userId}/ban`);
      toast.success(isActive ? 'Đã khóa' : 'Đã mở khóa');
      setAllUsers((prev) => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (confirm('Đặt lại mật khẩu thành 123456?')) {
      await api.put(`/admin/users/${userId}/reset-password`);
      toast.success('Reset mật khẩu thành công');
    }
  };

  const handleDelete = async (userId: number) => {
    if (confirm('Xóa người dùng này vĩnh viễn?')) {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Đã xóa');
      setAllUsers((prev) => prev.filter(u => u.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!loading && filteredUsers.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Không có người dùng"
        description="Không tìm thấy người dùng nào phù hợp."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Quản lý người dùng
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách người dùng trong hệ thống</p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email (gõ không dấu cũng được)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
        />
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Tên</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Vai trò</th>
                <th className="px-6 py-4 text-left">Trạng thái</th>
                <th className="px-6 py-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.id}</td>
                  <td
                    className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded-xl px-2 py-1 text-sm"
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleBanToggle(user.id, user.isActive)} className="text-yellow-600" title={user.isActive ? 'Khóa' : 'Mở khóa'}>
                        {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button onClick={() => handleResetPassword(user.id)} className="text-blue-600" title="Reset mật khẩu">
                        <Key size={18} />
                      </button>
                      <button onClick={() => navigate(`/admin/users/${user.id}`)} className="text-green-600" title="Xem chi tiết">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600" title="Xóa">
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            ← Trước
          </button>
          <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;