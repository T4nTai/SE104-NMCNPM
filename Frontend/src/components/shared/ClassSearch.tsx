import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { ClassInfo, StudentInClass } from '../../api/types';

interface ClassSearchProps {
  userRole: 'teacher' | 'student';
}

export function ClassSearch({ userRole }: ClassSearchProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentInClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('HK1');

  const filteredClasses = classes
    .map((c) => ({
      id: String((c as any).MaLop || (c as any).MaLop),
      name: (c as any).TenLop || (c as any).name || '',
      grade: (c as any).TenKhoiLop || (c as any).MaKhoiLop || 'Khối',
      totalStudents: (c as any).SiSo || (c as any).DanhSachHocSinh?.length || 0,
      raw: c,
    }))
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedGrade === 'all' || c.grade === selectedGrade));

  const clearError = () => setError(null);

  const loadStudents = useCallback(async (MaLop?: string) => {
    if (!MaLop) return setStudents([]);
    setLoadingStudents(true);
    try {
      const list = await api.getStudentsByClass(MaLop, selectedSemester);
      setStudents(list as StudentInClass[]);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách học sinh');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedSemester]);

  // Load classes for teacher or student's own classes
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingClasses(true);
      clearError();
      try {
        if (userRole === 'teacher') {
          const cls = await api.getTeacherClasses({ MaHocKy: selectedSemester });
          if (!mounted) return;
          setClasses(cls as ClassInfo[]);
          if (!selectedClass && (cls as any)?.[0]) {
            setSelectedClass((cls as any)[0]);
            loadStudents((cls as any)[0].MaLop);
          }
        } else {
          const my = await api.getMyClasses(selectedSemester);
          if (!mounted) return;
          const mapped = (my || []).map((m: any) => ({
            MaLop: m.MaLop,
            TenLop: m.TenLop,
            MaKhoiLop: m.MaKhoiLop,
            SiSo: m.SiSo || 0,
          }));
          setClasses(mapped as ClassInfo[]);
          if ((mapped as any)?.[0]) {
            setSelectedClass((mapped as any)[0]);
            loadStudents((mapped as any)[0].MaLop);
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Không thể tải danh sách lớp');
      } finally {
        if (mounted) setLoadingClasses(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userRole, selectedSemester]);

  return (
    <div>
      <h1 className={userRole === 'teacher' ? 'text-green-900 mb-6' : 'text-blue-900 mb-6'}>
        Tra cứu lớp học
      </h1>

      {userRole === 'teacher' && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Năm học</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Học kỳ</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="HK1">Học kỳ I</option>
                <option value="HK2">Học kỳ II</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === 'teacher' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Danh sách lớp</h2>
            
            {/* Tìm kiếm và lọc */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm tên lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tất cả khối</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loadingClasses ? (
                <div className="text-center py-8 text-gray-500">Đang tải danh sách lớp...</div>
              ) : filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => {
                      setSelectedClass(classItem.raw || (classItem as any));
                      // load students
                      const MaLop = (classItem.raw || classItem).MaLop || (classItem.raw || classItem).MaLop;
                      loadStudents(MaLop);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedClass && ((selectedClass as any).MaLop || (selectedClass as any).id) === classItem.id
                        ? 'bg-green-100 border-2 border-green-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-gray-900">{classItem.name}</p>
                        <p className="text-gray-600">{classItem.grade} - {classItem.totalStudents} HS</p>
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
        )}

        <div className={userRole === 'student' ? 'md:col-span-3' : 'md:col-span-2'}>
          {selectedClass ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Lớp {(selectedClass as any).TenLop || (selectedClass as any).name}</h2>
                  <p className="text-gray-600">{(selectedClass as any).TenKhoiLop || (selectedClass as any).MaKhoiLop || ''} - Sĩ số: {(selectedClass as any).SiSo || students.length} học sinh</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">STT</th>
                      <th className="px-4 py-3 text-left text-gray-700">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-gray-700">Giới tính</th>
                      <th className="px-4 py-3 text-left text-gray-700">Năm sinh</th>
                      <th className="px-4 py-3 text-left text-gray-700">Địa chỉ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loadingStudents ? (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Đang tải danh sách học sinh...</td></tr>
                    ) : students.length > 0 ? (
                      students.map((student, index) => (
                        <tr key={(student as any).MaHocSinh || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-900">{(student as any).HoTen || (student as any).TenHocSinh}</td>
                          <td className="px-4 py-3 text-gray-600">{(student as any).GioiTinh || (student as any).gioiTinh || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{(student as any).NgaySinh ? new Date((student as any).NgaySinh).getFullYear() : '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{(student as any).DiaChi || (student as any).address || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Không có học sinh</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chọn một lớp để xem thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
