import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Permission {
  maQuyen: number;
  phanQuyenHeThong: number;
  thayDoiThamSo: number;
  thayDoiQuyDinh: number;
  dieuChinhNghiepVu: number;
  traCuuDiemVaLopHoc: number;
  traCuuHocSinh: number;
}

interface UserGroup {
  maNhomNguoiDung: number;
  tenNhomNguoiDung: string;
  maQuyen: number;
  permission?: Permission;
}

const MOCK_PERMISSIONS: Permission[] = [
  { maQuyen: 1, phanQuyenHeThong: 1, thayDoiThamSo: 1, thayDoiQuyDinh: 1, dieuChinhNghiepVu: 1, traCuuDiemVaLopHoc: 1, traCuuHocSinh: 1 },
  { maQuyen: 2, phanQuyenHeThong: 0, thayDoiThamSo: 0, thayDoiQuyDinh: 0, dieuChinhNghiepVu: 1, traCuuDiemVaLopHoc: 1, traCuuHocSinh: 1 },
  { maQuyen: 3, phanQuyenHeThong: 0, thayDoiThamSo: 0, thayDoiQuyDinh: 0, dieuChinhNghiepVu: 0, traCuuDiemVaLopHoc: 1, traCuuHocSinh: 0 },
];

const MOCK_USER_GROUPS: UserGroup[] = [
  { maNhomNguoiDung: 1, tenNhomNguoiDung: 'Admin', maQuyen: 1 },
  { maNhomNguoiDung: 2, tenNhomNguoiDung: 'Giáo viên', maQuyen: 2 },
  { maNhomNguoiDung: 3, tenNhomNguoiDung: 'Học sinh', maQuyen: 3 },
];

export function UserGroupManagement() {
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<UserGroup, 'maNhomNguoiDung' | 'permission'>>({
    tenNhomNguoiDung: '',
    maQuyen: 1
  });

  // Simulate API call to fetch data
  useEffect(() => {
    fetchUserGroups();
    fetchPermissions();
  }, []);

  const fetchUserGroups = async () => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/user-groups');
    // const data = await response.json();
    // setUserGroups(data);
    const groupsWithPermissions = MOCK_USER_GROUPS.map(group => ({
      ...group,
      permission: MOCK_PERMISSIONS.find(p => p.maQuyen === group.maQuyen)
    }));
    setUserGroups(groupsWithPermissions);
  };

  const fetchPermissions = async () => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/permissions');
    // const data = await response.json();
    // setPermissions(data);
    setPermissions(MOCK_PERMISSIONS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // TODO: Replace with actual API call
      // await fetch(`/api/user-groups/${editingId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      setUserGroups(userGroups.map(g => 
        g.maNhomNguoiDung === editingId 
          ? { 
              ...formData, 
              maNhomNguoiDung: editingId,
              permission: permissions.find(p => p.maQuyen === formData.maQuyen)
            } 
          : g
      ));
      setEditingId(null);
    } else {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user-groups', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const newGroup = await response.json();
      
      const newGroup: UserGroup = { 
        ...formData, 
        maNhomNguoiDung: Date.now(),
        permission: permissions.find(p => p.maQuyen === formData.maQuyen)
      };
      setUserGroups([...userGroups, newGroup]);
      setIsAdding(false);
    }
    
    resetForm();
  };

  const handleEdit = (group: UserGroup) => {
    setEditingId(group.maNhomNguoiDung);
    setFormData({
      tenNhomNguoiDung: group.tenNhomNguoiDung,
      maQuyen: group.maQuyen
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm người dùng này?')) return;
    
    // TODO: Replace with actual API call
    // await fetch(`/api/user-groups/${id}`, { method: 'DELETE' });
    
    setUserGroups(userGroups.filter(g => g.maNhomNguoiDung !== id));
  };

  const resetForm = () => {
    setFormData({
      tenNhomNguoiDung: '',
      maQuyen: 1
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const getPermissionBadge = (value: number) => (
    <span className={`px-2 py-1 rounded text-xs ${
      value === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {value === 1 ? 'Có' : 'Không'}
    </span>
  );

  return (
    <div>
      <h1 className="text-blue-900 mb-6">Quản lý nhóm người dùng</h1>

      {/* Add Button */}
      <div className="flex justify-end items-center mb-6">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Thêm nhóm người dùng
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-blue-900 mb-4">
            {editingId ? 'Chỉnh sửa nhóm người dùng' : 'Thêm nhóm người dùng mới'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên nhóm người dùng *</label>
                <input
                  type="text"
                  required
                  value={formData.tenNhomNguoiDung}
                  onChange={(e) => setFormData({ ...formData, tenNhomNguoiDung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Quyền *</label>
                <select
                  value={formData.maQuyen}
                  onChange={(e) => setFormData({ ...formData, maQuyen: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {permissions.map(perm => (
                    <option key={perm.maQuyen} value={perm.maQuyen}>
                      Quyền {perm.maQuyen}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Permission Preview */}
            {formData.maQuyen && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-gray-900 mb-3">Xem trước quyền:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(() => {
                    const perm = permissions.find(p => p.maQuyen === formData.maQuyen);
                    return perm ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Phân quyền hệ thống:</span>
                          {getPermissionBadge(perm.phanQuyenHeThong)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Thay đổi tham số:</span>
                          {getPermissionBadge(perm.thayDoiThamSo)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Thay đổi quy định:</span>
                          {getPermissionBadge(perm.thayDoiQuyDinh)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Điều chỉnh nghiệp vụ:</span>
                          {getPermissionBadge(perm.dieuChinhNghiepVu)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Tra cứu điểm/lớp học:</span>
                          {getPermissionBadge(perm.traCuuDiemVaLopHoc)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm">Tra cứu học sinh:</span>
                          {getPermissionBadge(perm.traCuuHocSinh)}
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

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

      {/* User Groups Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Mã nhóm</th>
              <th className="px-6 py-3 text-left text-gray-700">Tên nhóm</th>
              <th className="px-6 py-3 text-left text-gray-700">Mã quyền</th>
              <th className="px-6 py-3 text-left text-gray-700">Phân quyền HT</th>
              <th className="px-6 py-3 text-left text-gray-700">Thay đổi TS</th>
              <th className="px-6 py-3 text-left text-gray-700">Thay đổi QĐ</th>
              <th className="px-6 py-3 text-left text-gray-700">Điều chỉnh NV</th>
              <th className="px-6 py-3 text-left text-gray-700">Tra cứu</th>
              <th className="px-6 py-3 text-left text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userGroups.map((group) => (
              <tr key={group.maNhomNguoiDung} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{group.maNhomNguoiDung}</td>
                <td className="px-6 py-4 text-gray-900">{group.tenNhomNguoiDung}</td>
                <td className="px-6 py-4 text-gray-600">{group.maQuyen}</td>
                <td className="px-6 py-4">{group.permission && getPermissionBadge(group.permission.phanQuyenHeThong)}</td>
                <td className="px-6 py-4">{group.permission && getPermissionBadge(group.permission.thayDoiThamSo)}</td>
                <td className="px-6 py-4">{group.permission && getPermissionBadge(group.permission.thayDoiQuyDinh)}</td>
                <td className="px-6 py-4">{group.permission && getPermissionBadge(group.permission.dieuChinhNghiepVu)}</td>
                <td className="px-6 py-4">{group.permission && getPermissionBadge(group.permission.traCuuDiemVaLopHoc)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(group)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.maNhomNguoiDung)}
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
      </div>
    </div>
  );
}
