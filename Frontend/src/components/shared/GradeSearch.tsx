import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../api/client';
import { GradeRecord, StudentInClass } from '../../api/types';

interface TeacherGradePayload {
  MaHocSinh: string;
  HoTen: string;
  DiemGiuaKy?: number;
  DiemCuoiKy?: number;
  DiemTBMon?: number;
}

// Mock data removed. Integrate real data via props or API.

interface GradeSearchProps {
  userRole: 'teacher' | 'student';
}

export function GradeSearch({ userRole }: GradeSearchProps) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedSubject, setSelectedSubject] = useState('Toán');
  const [selectedSemester, setSelectedSemester] = useState('HK1-2024-2025');

  // Student role: get own grades and classes
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [errorStudent, setErrorStudent] = useState<string | null>(null);

  // Teacher role: get class students and their grades
  const [classStudents, setClassStudents] = useState<TeacherGradePayload[]>([]);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [errorTeacher, setErrorTeacher] = useState<string | null>(null);

  // Load student's own grades
  useEffect(() => {
    if (userRole === 'student') {
      setLoadingStudent(true);
      setErrorStudent(null);
      Promise.all([
        api.getMyClasses(),
        api.getMyScores('HK1'), // Extract semester ID from selectedSemester
      ])
        .then(([classes, grades]) => {
          setStudentClasses(classes);
          setGrades(grades);
        })
        .catch((err) => {
          setErrorStudent(err.message);
        })
        .finally(() => setLoadingStudent(false));
    }
  }, [userRole, selectedSemester]);

  // Load teacher's class students
  useEffect(() => {
    if (userRole === 'teacher') {
      setLoadingTeacher(true);
      setErrorTeacher(null);
      api
        .getTeacherClasses()
        .then((classes) => {
          // Find selected class and get its students
          const cls = classes.find((c) => c.TenLop === selectedClass);
          if (cls && cls.DanhSachHocSinh) {
            setClassStudents(
              cls.DanhSachHocSinh.map((s) => ({
                MaHocSinh: s.MaHocSinh,
                HoTen: s.HoTen,
                DiemGiuaKy: undefined,
                DiemCuoiKy: undefined,
                DiemTBMon: undefined,
              }))
            );
          }
        })
        .catch((err) => {
          setErrorTeacher(err.message);
        })
        .finally(() => setLoadingTeacher(false));
    }
  }, [userRole, selectedClass]);

  const overallAverage =
    grades.length > 0 ? grades.reduce((sum, g) => sum + (g.DiemTBMon || 0), 0) / grades.length : 0;
  const excellentCount = grades.filter((g) => (g.DiemTBMon || 0) >= 8).length;
  const goodCount = grades.filter((g) => (g.DiemTBMon || 0) >= 6.5 && (g.DiemTBMon || 0) < 8).length;

  const classOverallAverage =
    classStudents.length > 0
      ? classStudents.reduce((sum, s) => sum + (s.DiemTBMon || 0), 0) / classStudents.length
      : 0;
  const classExcellentCount = classStudents.filter((s) => (s.DiemTBMon || 0) >= 8).length;
  const classPoorCount = classStudents.filter((s) => (s.DiemTBMon || 0) < 5).length;

  return (
    <div>
      <h1 className={userRole === 'teacher' ? 'text-green-900 mb-6' : 'text-blue-900 mb-6'}>
        Tra cứu điểm
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {userRole === 'teacher' && (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Lớp</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="10A1">10A1</option>
                  <option value="10A2">10A2</option>
                  <option value="10A3">10A3</option>
                  <option value="11A1">11A1</option>
                  <option value="12A1">12A1</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Môn học</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Toán">Toán</option>
                  <option value="Văn">Văn</option>
                  <option value="Lý">Lý</option>
                  <option value="Hóa">Hóa</option>
                  <option value="Sinh">Sinh</option>
                  <option value="Sử">Sử</option>
                  <option value="Địa">Địa</option>
                  <option value="Đạo Đức">Đạo Đức</option>
                  <option value="Thể Dục">Thể Dục</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700 mb-2">Học kỳ</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HK1-2024-2025">Học kỳ I - 2024-2025</option>
              <option value="HK2-2024-2025">Học kỳ II - 2024-2025</option>
              <option value="HK1-2023-2024">Học kỳ I - 2023-2024</option>
              <option value="HK2-2023-2024">Học kỳ II - 2023-2024</option>
            </select>
          </div>
        </div>
      </div>

      {userRole === 'student' && (
        <>
          {loadingStudent && <div className="text-blue-600 mb-4">Đang tải dữ liệu...</div>}
          {errorStudent && <div className="text-red-600 mb-4">Lỗi: {errorStudent}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-blue-700 mb-1">Điểm trung bình</p>
              <p className="text-blue-900">{overallAverage.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-700 mb-1">Môn giỏi</p>
                  <p className="text-green-900">{excellentCount} môn</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-yellow-700 mb-1">Môn khá</p>
                  <p className="text-yellow-900">{goodCount} môn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700">Môn học</th>
                    <th className="px-6 py-4 text-left text-gray-700">Giữa kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">Cuối kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB Môn</th>
                    <th className="px-6 py-4 text-left text-gray-700">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {grades.length > 0 ? (
                    grades.map((grade) => (
                      <tr key={grade.MaMon} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{grade.TenMon}</td>
                        <td className="px-6 py-4 text-gray-600">{grade.DiemGiuaKy ?? '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{grade.DiemCuoiKy ?? '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded ${
                              (grade.DiemTBMon ?? 0) >= 8
                                ? 'bg-green-100 text-green-700'
                                : (grade.DiemTBMon ?? 0) >= 6.5
                                  ? 'bg-blue-100 text-blue-700'
                                  : (grade.DiemTBMon ?? 0) >= 5
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {grade.DiemTBMon?.toFixed(1) ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded ${
                              grade.XepLoai === 'Xuất sắc'
                                ? 'bg-green-100 text-green-700'
                                : grade.XepLoai === 'Giỏi'
                                  ? 'bg-blue-100 text-blue-700'
                                  : grade.XepLoai === 'Khá'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {grade.XepLoai ?? '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Chưa có dữ liệu điểm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {userRole === 'teacher' && (
        <>
          {loadingTeacher && <div className="text-green-600 mb-4">Đang tải dữ liệu...</div>}
          {errorTeacher && <div className="text-red-600 mb-4">Lỗi: {errorTeacher}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-blue-700 mb-1">ĐTB lớp - Môn {selectedSubject}</p>
              <p className="text-blue-900">{classOverallAverage.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-700 mb-1">HS giỏi (ĐTB {'>'}= 8)</p>
                  <p className="text-green-900">{classExcellentCount} HS</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-700 mb-1">HS yếu (ĐTB &lt; 5)</p>
                  <p className="text-red-900">{classPoorCount} HS</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-gray-900">Bảng điểm môn {selectedSubject} - Lớp {selectedClass}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700">Mã HS</th>
                    <th className="px-6 py-4 text-left text-gray-700">Họ và tên</th>
                    <th className="px-6 py-4 text-left text-gray-700">Giữa kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">Cuối kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB Môn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classStudents.length > 0 ? (
                    classStudents.map((student) => (
                      <tr key={student.MaHocSinh} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{student.MaHocSinh}</td>
                        <td className="px-6 py-4 text-gray-900">{student.HoTen}</td>
                        <td className="px-6 py-4 text-gray-600">{student.DiemGiuaKy ?? '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{student.DiemCuoiKy ?? '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded ${
                              (student.DiemTBMon ?? 0) >= 8
                                ? 'bg-green-100 text-green-700'
                                : (student.DiemTBMon ?? 0) >= 6.5
                                  ? 'bg-blue-100 text-blue-700'
                                  : (student.DiemTBMon ?? 0) >= 5
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {student.DiemTBMon?.toFixed(1) ?? '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Chưa có học sinh trong lớp này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}