import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Search, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { ClassInfo } from '../../api/types';

interface Student {
  id: string;
  studentCode: string;
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  students: Student[];
}

// Mock classes removed. Integrate real data via props or API.

export function ClassListManagement() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'all' | string>('all');
  const [academicYears, setAcademicYears] = useState<Array<{ MaNH: number; Nam1: number; Nam2: number; name: string }>>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [semesters, setSemesters] = useState<Array<{ MaHK: number; TenHK: string }>>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [grades, setGrades] = useState<Array<{ MaKL: number; TenKL: string }>>([]);
  const [formData, setFormData] = useState<{
    MaHocSinh: string;
    HoTen: string;
    GioiTinh: string;
    NgaySinh: string;
    Email: string;
    SDT: string;
    DiaChi: string;
  }>({
    MaHocSinh: '',
    HoTen: '',
    GioiTinh: 'Nam',
    NgaySinh: '',
    Email: '',
    SDT: '',
    DiaChi: '',
  });
  const [notify, setNotify] = useState<string | null>(null);

  // Load years, semesters, grades on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [years, sems, grs] = await Promise.all([
          api.listAcademicYears(),
          api.listSemesters(),
          api.listGrades(),
        ]);

        const mappedYears = (years || []).map((y: any) => ({ MaNH: y.MaNH, Nam1: y.Nam1, Nam2: y.Nam2, name: `${y.Nam1}-${y.Nam2}` }))
          .sort((a: any, b: any) => b.Nam1 - a.Nam1);
        setAcademicYears(mappedYears);
        const defaultYearId = mappedYears[0]?.MaNH ?? null;
        setSelectedYearId(defaultYearId);

        setSemesters((sems || []).map((s: any) => ({ MaHK: s.MaHK, TenHK: s.TenHK })));
        if (sems && sems.length > 0) setSelectedSemester(String(sems[0].MaHK));

        setGrades((grs || []).map((g: any) => ({ MaKL: g.MaKL, TenKL: g.TenKL })));

        const firstSemester = sems && sems.length > 0 ? String(sems[0].MaHK) : null;
        if (firstSemester) setSelectedSemester(firstSemester);

        // Load classes for default year
        const classData = await api.getTeacherClasses(defaultYearId && firstSemester ? { MaNamHoc: String(defaultYearId), MaHocKy: firstSemester } : undefined);
        setClasses(classData);
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu ban đầu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reload classes when academic year changes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const classData = await api.getTeacherClasses(
          selectedYearId ? { MaNamHoc: String(selectedYearId), MaHocKy: selectedSemester } : undefined
        );
        setClasses(classData);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách lớp');
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, [selectedYearId, selectedSemester]);

  const handleSelectClass = async (classItem: ClassInfo) => {
    setSelectedClass(classItem);
    setIsAddingStudent(false);
    setEditingStudentId(null);
    
    // Fetch students for this class and selected semester
    if (selectedSemester) {
      try {
        const students = await api.getStudentsByClass(classItem.MaLop, selectedSemester);
        setSelectedClass({ ...classItem, DanhSachHocSinh: students });
      } catch (err: any) {
        console.error('Failed to load students:', err);
        setNotify('Không thể tải danh sách học sinh');
        setTimeout(() => setNotify(null), 3000);
      }
    }
  };

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      // Check age (15-20)
      const birthDate = new Date(formData.NgaySinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 15 || age > 20) {
        alert('Tuổi học sinh phải từ 15 đến 20');
        return;
      }

      // Check class capacity
      if (!editingStudentId && (selectedClass.DanhSachHocSinh?.length ?? 0) >= 40) {
        alert('Lớp đã đủ sĩ số (tối đa 40 học sinh)');
        return;
      }

      if (editingStudentId) {
        // Update student
        await api.updateStudent(editingStudentId, {
          MaHocSinh: formData.MaHocSinh,
          HoTen: formData.HoTen,
          GioiTinh: formData.GioiTinh,
          NgaySinh: formData.NgaySinh,
          Email: formData.Email,
          SDT: formData.SDT,
          DiaChi: formData.DiaChi,
        });
        setNotify('Cập nhật học sinh thành công');
      } else {
        // Add student to class/semester - use selected semester ID from DB
        const hocKyId = selectedSemester || '1';
        const result = await api.addStudentToClass(selectedClass.MaLop, hocKyId, {
          MaHocSinh: formData.MaHocSinh,
          HoTen: formData.HoTen,
          GioiTinh: formData.GioiTinh,
          NgaySinh: formData.NgaySinh,
          Email: formData.Email,
          SDT: formData.SDT,
          DiaChi: formData.DiaChi,
        });
        if (result && (result as any).createdAccount) {
          const ca = (result as any).createdAccount;
          setNotify(`Thêm học sinh thành công. Đã tạo tài khoản ${ca.TenDangNhap} và gửi email tới ${ca.Email}.`);
        } else {
          setNotify('Thêm học sinh vào lớp thành công');
        }
      }

      // Reload students for the current class
      if (selectedSemester) {
        const students = await api.getStudentsByClass(selectedClass.MaLop, selectedSemester);
        setSelectedClass({ ...selectedClass, DanhSachHocSinh: students });
      }

      setIsAddingStudent(false);
      setEditingStudentId(null);
      setFormData({
        MaHocSinh: '',
        HoTen: '',
        GioiTinh: 'Nam',
        NgaySinh: '',
        Email: '',
        SDT: '',
        DiaChi: '',
      });

      // Auto-hide notification after 5s
      setTimeout(() => setNotify(null), 5000);
    } catch (err) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Không thể thêm/cập nhật học sinh'));
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudentId(student.MaHocSinh);
    setFormData({
      MaHocSinh: student.MaHocSinh,
      HoTen: student.HoTen,
      GioiTinh: student.GioiTinh,
      NgaySinh: student.NgaySinh,
      Email: student.Email || '',
      SDT: student.SDT || '',
      DiaChi: student.DiaChi || '',
    });
    setIsAddingStudent(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!selectedClass) return;
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;

    try {
      await api.deleteStudent(studentId);

      // Reload students for the current class
      if (selectedSemester) {
        const students = await api.getStudentsByClass(selectedClass.MaLop, selectedSemester);
        setSelectedClass({ ...selectedClass, DanhSachHocSinh: students });
      }
      setNotify('Xóa học sinh thành công');
      setTimeout(() => setNotify(null), 3000);
    } catch (err) {
      alert('Lỗi: ' + (err instanceof Error ? err.message : 'Không thể xóa học sinh'));
    }
  };

  const filteredStudents = selectedClass?.DanhSachHocSinh?.filter((s) =>
    s.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.MaHocSinh.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredClasses = classes.filter(
    (c) =>
      c.TenLop.toLowerCase().includes(classSearchTerm.toLowerCase()) &&
      (selectedGrade === 'all' || String(c.MaKhoiLop) === selectedGrade)
  );

  return (
    <div>
      <h1 className="text-green-900 mb-6">Quản lý danh sách lớp</h1>

      {loading && <div className="text-green-600 mb-4">Đang tải dữ liệu...</div>}
      {error && <div className="text-red-600 mb-4">Lỗi: {error}</div>}
      {notify && (
        <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 border border-green-200">{notify}</div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-green-600" />
          Tra cứu danh sách lớp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Năm học</label>
            <select
              value={selectedYearId ?? ''}
              onChange={(e) => setSelectedYearId(Number(e.target.value) || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Chọn năm học --</option>
              {academicYears.map((y) => (
                <option key={y.MaNH} value={y.MaNH}>{y.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Học kỳ</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {semesters.map((s) => (
                <option key={s.MaHK} value={String(s.MaHK)}>{s.TenHK}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Tìm kiếm theo tên lớp</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nhập tên lớp (VD: 10A1)..."
                value={classSearchTerm}
                onChange={(e) => setClassSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Lọc theo khối</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tất cả khối</option>
                {grades.map((g) => (
                  <option key={g.MaKL} value={String(g.MaKL)}>{g.TenKL}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>Tổng số lớp: <strong className="text-gray-900">{filteredClasses.length}</strong></span>
          <span>Tổng số học sinh: <strong className="text-gray-900">{filteredClasses.reduce((sum, c) => sum + (c.DanhSachHocSinh?.length ?? 0), 0)}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-gray-900 mb-4">Danh sách lớp</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredClasses.length > 0 ? (
              filteredClasses.map(classItem => (
                <button
                  key={classItem.MaLop}
                  onClick={() => handleSelectClass(classItem)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedClass?.MaLop === classItem.MaLop
                      ? 'bg-green-100 border-2 border-green-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-gray-900">{classItem.TenLop}</p>
                      <p className="text-gray-600">Khối: {(classItem as any).TenKhoiLop || classItem.MaKhoiLop} • HS: {(classItem as any).SoLuongHocSinh ?? classItem.DanhSachHocSinh?.length ?? 0}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Không tìm thấy lớp nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedClass ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900">Lớp {selectedClass.TenLop}</h2>
                {!isAddingStudent && (
                  <button
                    onClick={() => setIsAddingStudent(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm học sinh
                  </button>
                )}
              </div>

              {isAddingStudent && (
                <form onSubmit={handleSubmitStudent} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-gray-900 mb-3">
                    {editingStudentId ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Mã học sinh"
                      value={formData.MaHocSinh}
                      onChange={(e) => setFormData({ ...formData, MaHocSinh: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={formData.HoTen}
                      onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <select
                      value={formData.GioiTinh}
                      onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                    <input
                      type="date"
                      value={formData.NgaySinh}
                      onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.Email}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại"
                      value={formData.SDT}
                      onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ"
                      value={formData.DiaChi}
                      onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 col-span-2"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      {editingStudentId ? 'Cập nhật' : 'Thêm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingStudent(false);
                        setEditingStudentId(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">Mã HS</th>
                      <th className="px-4 py-3 text-left text-gray-700">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-gray-700">Giới tính</th>
                      <th className="px-4 py-3 text-left text-gray-700">Ngày sinh</th>
                      <th className="px-4 py-3 text-left text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.MaHocSinh} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{student.MaHocSinh}</td>
                        <td className="px-4 py-3 text-gray-900">{student.HoTen}</td>
                        <td className="px-4 py-3 text-gray-600">{student.GioiTinh}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(student.NgaySinh).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.MaHocSinh)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chọn một lớp để xem danh sách học sinh</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}