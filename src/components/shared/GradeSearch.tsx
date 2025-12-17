import { useState } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

interface GradeRecord {
  subject: string;
  mieng15Phut: number[];
  mot1Tiet: number[];
  giuaKy: number;
  cuoiKy: number;
  diemTBMieng15: number;
  diemTB1Tiet: number;
  average: number;
  rank: string;
}

interface StudentGrade {
  studentId: string;
  studentCode: string;
  studentName: string;
  mieng15Phut: number[];
  mot1Tiet: number[];
  giuaKy: number | null;
  cuoiKy: number | null;
  diemTBMieng15: number | null;
  diemTB1Tiet: number | null;
  average: number | null;
}

const MOCK_GRADES: GradeRecord[] = [
  { subject: 'Toán', mieng15Phut: [8, 7.5, 9], mot1Tiet: [8, 8.5], giuaKy: 8.5, cuoiKy: 8, diemTBMieng15: 8.2, diemTB1Tiet: 8.3, average: 8.2, rank: 'Giỏi' },
  { subject: 'Văn', mieng15Phut: [9, 8.5, 8], mot1Tiet: [9], giuaKy: 9, cuoiKy: 9.5, diemTBMieng15: 8.5, diemTB1Tiet: 9, average: 9.0, rank: 'Xuất sắc' },
  { subject: 'Lý', mieng15Phut: [7, 7.5, 8], mot1Tiet: [7.5], giuaKy: 7.5, cuoiKy: 8, diemTBMieng15: 7.5, diemTB1Tiet: 7.5, average: 7.7, rank: 'Khá' },
  { subject: 'Hóa', mieng15Phut: [6, 6.5, 7], mot1Tiet: [6.5], giuaKy: 6.5, cuoiKy: 7, diemTBMieng15: 6.5, diemTB1Tiet: 6.5, average: 6.7, rank: 'Khá' },
  { subject: 'Sinh', mieng15Phut: [7.5, 8, 7], mot1Tiet: [7.5], giuaKy: 7.5, cuoiKy: 7.5, diemTBMieng15: 7.5, diemTB1Tiet: 7.5, average: 7.5, rank: 'Khá' },
  { subject: 'Sử', mieng15Phut: [8, 8.5], mot1Tiet: [8], giuaKy: 8, cuoiKy: 8.5, diemTBMieng15: 8.3, diemTB1Tiet: 8, average: 8.2, rank: 'Giỏi' },
  { subject: 'Địa', mieng15Phut: [7, 7.5], mot1Tiet: [7], giuaKy: 7, cuoiKy: 7.5, diemTBMieng15: 7.3, diemTB1Tiet: 7, average: 7.2, rank: 'Khá' },
  { subject: 'Đạo Đức', mieng15Phut: [9, 9], mot1Tiet: [9], giuaKy: 9, cuoiKy: 9, diemTBMieng15: 9, diemTB1Tiet: 9, average: 9.0, rank: 'Xuất sắc' },
  { subject: 'Thể Dục', mieng15Phut: [8, 8.5], mot1Tiet: [8], giuaKy: 8.5, cuoiKy: 8.5, diemTBMieng15: 8.3, diemTB1Tiet: 8, average: 8.3, rank: 'Giỏi' },
];

const MOCK_CLASS_GRADES: StudentGrade[] = [
  { 
    studentId: '1', 
    studentCode: 'HS001', 
    studentName: 'Nguyễn Văn An', 
    mieng15Phut: [8, 7.5], 
    mot1Tiet: [8, 7], 
    giuaKy: 7.5, 
    cuoiKy: 8,
    diemTBMieng15: 7.8,
    diemTB1Tiet: 7.5,
    average: 7.7
  },
  { 
    studentId: '2', 
    studentCode: 'HS002', 
    studentName: 'Trần Thị Bình', 
    mieng15Phut: [9, 8.5], 
    mot1Tiet: [9], 
    giuaKy: 8.5, 
    cuoiKy: 9,
    diemTBMieng15: 8.8,
    diemTB1Tiet: 9,
    average: 8.8
  },
  { 
    studentId: '3', 
    studentCode: 'HS003', 
    studentName: 'Lê Văn Cường', 
    mieng15Phut: [7, 6.5], 
    mot1Tiet: [7], 
    giuaKy: 6.5, 
    cuoiKy: 7,
    diemTBMieng15: 6.8,
    diemTB1Tiet: 7,
    average: 6.8
  },
  { 
    studentId: '4', 
    studentCode: 'HS004', 
    studentName: 'Phạm Thị Dung', 
    mieng15Phut: [8, 8.5, 9], 
    mot1Tiet: [8.5], 
    giuaKy: 8, 
    cuoiKy: 8.5,
    diemTBMieng15: 8.5,
    diemTB1Tiet: 8.5,
    average: 8.4
  },
  { 
    studentId: '5', 
    studentCode: 'HS005', 
    studentName: 'Hoàng Văn Em', 
    mieng15Phut: [6, 6.5], 
    mot1Tiet: [6], 
    giuaKy: 6, 
    cuoiKy: 6.5,
    diemTBMieng15: 6.3,
    diemTB1Tiet: 6,
    average: 6.2
  },
];

interface GradeSearchProps {
  userRole: 'teacher' | 'student';
}

export function GradeSearch({ userRole }: GradeSearchProps) {
  const [selectedStudent, setSelectedStudent] = useState(userRole === 'student' ? 'HS003' : '');
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedSubject, setSelectedSubject] = useState('Toán');
  const [selectedSemester, setSelectedSemester] = useState('HK1-2024-2025');
  const [grades] = useState<GradeRecord[]>(MOCK_GRADES);
  const [classGrades] = useState<StudentGrade[]>(MOCK_CLASS_GRADES);

  const overallAverage = grades.reduce((sum, g) => sum + g.average, 0) / grades.length;
  const excellentCount = grades.filter(g => g.average >= 8).length;
  const goodCount = grades.filter(g => g.average >= 6.5 && g.average < 8).length;

  const classOverallAverage = classGrades.reduce((sum, g) => sum + (g.average || 0), 0) / classGrades.length;
  const classExcellentCount = classGrades.filter(g => g.average !== null && g.average >= 8).length;
  const classPoorCount = classGrades.filter(g => g.average !== null && g.average < 5).length;

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
                    <th className="px-6 py-4 text-left text-gray-700">Miệng/15&apos;</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB Miệng</th>
                    <th className="px-6 py-4 text-left text-gray-700">1 Tiết</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB 1 Tiết</th>
                    <th className="px-6 py-4 text-left text-gray-700">Giữa kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">Cuối kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB Môn</th>
                    <th className="px-6 py-4 text-left text-gray-700">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {grades.map((grade, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{grade.subject}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {grade.mieng15Phut.map((score, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {score}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded">
                          {grade.diemTBMieng15.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {grade.mot1Tiet.map((score, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {score}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded">
                          {grade.diemTB1Tiet.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{grade.giuaKy}</td>
                      <td className="px-6 py-4 text-gray-600">{grade.cuoiKy}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded ${
                          grade.average >= 8 ? 'bg-green-100 text-green-700' :
                          grade.average >= 6.5 ? 'bg-blue-100 text-blue-700' :
                          grade.average >= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {grade.average.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded ${
                          grade.rank === 'Xuất sắc' ? 'bg-green-100 text-green-700' :
                          grade.rank === 'Giỏi' ? 'bg-blue-100 text-blue-700' :
                          grade.rank === 'Khá' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {grade.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {userRole === 'teacher' && (
        <>
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
                    <th className="px-6 py-4 text-left text-gray-700">Miệng/15&apos;</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB Miệng</th>
                    <th className="px-6 py-4 text-left text-gray-700">1 Tiết</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB 1 Tiết</th>
                    <th className="px-6 py-4 text-left text-gray-700">Giữa kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">Cuối kỳ</th>
                    <th className="px-6 py-4 text-left text-gray-700">ĐTB Môn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classGrades.map((student) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{student.studentCode}</td>
                      <td className="px-6 py-4 text-gray-900">{student.studentName}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {student.mieng15Phut.map((score, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {score}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded">
                          {student.diemTBMieng15 !== null ? student.diemTBMieng15.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {student.mot1Tiet.map((score, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {score}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded">
                          {student.diemTB1Tiet !== null ? student.diemTB1Tiet.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.giuaKy !== null ? student.giuaKy : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.cuoiKy !== null ? student.cuoiKy : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded ${
                          student.average !== null && student.average >= 8 ? 'bg-green-100 text-green-700' :
                          student.average !== null && student.average >= 6.5 ? 'bg-blue-100 text-blue-700' :
                          student.average !== null && student.average >= 5 ? 'bg-yellow-100 text-yellow-700' :
                          student.average !== null ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {student.average !== null ? student.average.toFixed(1) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}