import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Loader2 } from 'lucide-react';
import { userApi, userGroupApi } from '../../services/api';

interface User {
  maNguoiDung: number;
  tenDangNhap: string;
  matKhau: string;
  hoVaTen: string;
  email: string;
  maNhomNguoiDung: number;
  tenNhomNguoiDung?: string;
}

interface UserGroup {
  maNhomNguoiDung: number;
  tenNhomNguoiDung: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'maNguoiDung' | 'tenNhomNguoiDung'>>({
    tenDangNhap: '',
    matKhau: '',
    hoVaTen: '',
    email: '',
    maNhomNguoiDung: 1
  });

  useEffect(() => {
    fetchUsers();
    fetchUserGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const data = await userGroupApi.getAll();
      setUserGroups(data);
    } catch (err: any) {
      console.error('Error fetching user groups:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (editingId) {
        await userApi.update(editingId, formData);
        await fetchUsers();
      } else {
        const newUser = await userApi.create(formData);
        setUsers([...users, newUser]);
      }
      
      setIsAdding(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Không thể lưu người dùng');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.maNguoiDung);
    setFormData({
      tenDangNhap: user.tenDangNhap,
      matKhau: user.matKhau,
      hoVaTen: user.hoVaTen,
      email: user.email,
      maNhomNguoiDung: user.maNhomNguoiDung
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await userApi.delete(id);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Không thể xóa người dùng');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenDangNhap: '',
      matKhau: '',
      hoVaTen: '',
      email: '',
      maNhomNguoiDung: 1
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.hoVaTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.tenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = selectedGroup === 'all' || u.maNhomNguoiDung === selectedGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div>
      <h1 className="text-blue-900 mb-6">Quản lý người dùng</h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!loading && (
        <>
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, tên đăng nhập, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả nhóm</option>
                  {userGroups.map(group => (
                    <option key={group.maNhomNguoiDung} value={group.maNhomNguoiDung}>
                      {group.tenNhomNguoiDung}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end items-center mb-6">
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Thêm người dùng
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {isAdding && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-blue-900 mb-4">
                {editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Tên đăng nhập *</label>
                    <input
                      type="text"
                      required
                      value={formData.tenDangNhap}
                      onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Mật khẩu *</label>
                    <input
                      type="password"
                      required
                      value={formData.matKhau}
                      onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.hoVaTen}
                      onChange={(e) => setFormData({ ...formData, hoVaTen: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@school.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Nhóm người dùng *</label>
                    <select
                      value={formData.maNhomNguoiDung}
                      onChange={(e) => setFormData({ ...formData, maNhomNguoiDung: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {userGroups.map(group => (
                        <option key={group.maNhomNguoiDung} value={group.maNhomNguoiDung}>
                          {group.tenNhomNguoiDung}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                    {editingId ? 'Cập nhật' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Mã ND</th>
                  <th className="px-6 py-3 text-left text-gray-700">Tên đăng nhập</th>
                  <th className="px-6 py-3 text-left text-gray-700">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-gray-700">Nhóm</th>
                  <th className="px-6 py-3 text-left text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.maNguoiDung} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{user.maNguoiDung}</td>
                    <td className="px-6 py-4 text-gray-900">{user.tenDangNhap}</td>
                    <td className="px-6 py-4 text-gray-900">{user.hoVaTen}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.maNhomNguoiDung === 1 ? 'bg-indigo-100 text-indigo-700' :
                        user.maNhomNguoiDung === 2 ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.tenNhomNguoiDung}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.maNguoiDung)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy người dùng nào
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}