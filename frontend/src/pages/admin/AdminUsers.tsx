import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Key, Lock, Plus, Search, Trash, Unlock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isActive: boolean;
  isOnline?: boolean;
};

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const getApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data.slice(0, 160);
  return data?.error || data?.message || fallback;
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as AdminUser['role'],
    isActive: true,
  });
  const itemsPerPage = 20;

  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const response = await api.get('/admin/users?limit=1000');
        const users = (response.data.data as AdminUser[]).sort((a, b) => a.id - b.id);
        setAllUsers(users);
      } catch {
        toast.error('Khong th? tai danh sach nguoi dung');
      } finally {
        setLoading(false);
      }
    };

    loadAllUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return allUsers;

    const keyword = normalize(searchInput);
    return allUsers.filter((user) => (
      normalize(user.name).includes(keyword) || normalize(user.email).includes(keyword)
    ));
  }, [allUsers, searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleRoleChange = async (userId: number, role: AdminUser['role']) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setAllUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
      toast.success('Da cap nhat vai tro');
    } catch {
      toast.error('Cap nhat vai tro that bai');
    }
  };

  const handleBanToggle = async (userId: number, isActive: boolean) => {
    const confirmed = window.confirm(isActive ? 'Khoa tai kho?n nay?' : 'Mo khoa tai kho?n nay?');
    if (!confirmed) return;

    try {
      await api.put(`/admin/users/${userId}/ban`);
      setAllUsers((prev) => prev.map((user) => (
        user.id === userId ? { ...user, isActive: !isActive } : user
      )));
      toast.success(isActive ? 'Da khoa tai kho?n' : 'Da mo khoa tai kho?n');
    } catch {
      toast.error('Cap nhat trang thai tai kho?n that bai');
    }
  };

  const handleResetPassword = async (userId: number) => {
    const confirmed = window.confirm('Reset mat khau ve 123456?');
    if (!confirmed) return;

    try {
      await api.put(`/admin/users/${userId}/reset-password`);
      toast.success('Da reset mat khau');
    } catch {
      toast.error('Reset mat khau that bai');
    }
  };

  const handleDelete = async (userId: number) => {
    const confirmed = window.confirm('Xoa tai kho?n nay vinh vien?');
    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setAllUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success('Da xoa tai kho?n');
    } catch {
      toast.error('Xoa tai kho?n that bai');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      isActive: true,
    });
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = createForm.name.trim();
    const email = createForm.email.trim();

    if (!name || !email || createForm.password.length < 6) {
      toast.error('Nhap ten, email va mat khau toi thieu 6 ky tu');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/admin/users', {
        name,
        email,
        password: createForm.password,
        role: createForm.role,
        isActive: createForm.isActive,
      });
      const newUser = response.data.data as AdminUser;
      setAllUsers((prev) => [newUser, ...prev].sort((a, b) => a.id - b.id));
      setShowCreateModal(false);
      resetCreateForm();
      toast.success('Da tao nguoi dung');
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Tao nguoi dung that bai'));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-12 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Quan ly nguoi dung
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Trang thai online duoc tinh theo phien Dang nhap dang su dung.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus size={18} /> Them nguoi dung
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tim theo ten hoac email..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-slate-900 dark:text-slate-100 transition"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {allUsers.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={Search}
                title="Khong co nguoi dung"
                description="He thong chua co du lieu nguoi dung. Bam Them nguoi dung de tao tai khoan moi."
              />
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/70 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Ten</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Vai tro</th>
                  <th className="px-6 py-4 text-left">Trang thai</th>
                  <th className="px-6 py-4 text-left">Hanh dong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">
                      Khong co du lieu
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-300">{user.id}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value as AdminUser['role'])}
                        className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-xl px-2 py-1 text-sm text-gray-700 dark:text-slate-200"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!user.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                          Bi khoa
                        </span>
                      ) : user.isOnline ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Dang online
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleBanToggle(user.id, user.isActive)}
                          className="text-yellow-600 dark:text-yellow-400"
                          title={user.isActive ? 'Khoa tai kho?n' : 'Mo khoa tai kho?n'}
                        >
                          {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button onClick={() => handleResetPassword(user.id)} className="text-blue-600 dark:text-blue-400" title="Reset mat khau">
                          <Key size={18} />
                        </button>
                        <button onClick={() => navigate(`/admin/users/${user.id}`)} className="text-green-600 dark:text-green-400" title="Xem chi tiet">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-600 dark:text-red-400" title="Xoa tai kho?n">
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
          >
            Truoc
          </button>
          <span className="text-gray-600 dark:text-slate-400">Trang {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
          >
            Sau
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Them nguoi dung</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Tao tai khoan moi cho user, moderator hoac admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-slate-300">Ten hien thi</label>
                <input
                  value={createForm.name}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Nguyen Van A"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-slate-300">Email dang nhap</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-slate-300">Mat khau tam thoi</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Toi thieu 6 ky tu"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-slate-300">Vai tro</label>
                  <select
                    value={createForm.role}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as AdminUser['role'] }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:text-slate-300">
                  Kich hoat tai khoan
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Dang tao...' : 'Tao nguoi dung'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
