import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download } from 'lucide-react';

interface SubjectReportData {
  subject: string;
  excellent: number;
  good: number;
  average: number;
  poor: number;
  totalStudents: number;
  averageScore: number;
  passed: number; // Số học sinh đạt (điểm >= 5)
}

const MOCK_DATA: SubjectReportData[] = [
  { subject: 'Toán', excellent: 45, good: 78, average: 56, poor: 12, totalStudents: 191, averageScore: 7.2, passed: 179 },
  { subject: 'Văn', excellent: 38, good: 82, average: 61, poor: 10, totalStudents: 191, averageScore: 7.0, passed: 181 },
  { subject: 'Lý', excellent: 35, good: 68, average: 65, poor: 23, totalStudents: 191, averageScore: 6.8, passed: 168 },
  { subject: 'Hóa', excellent: 42, good: 71, average: 58, poor: 20, totalStudents: 191, averageScore: 6.9, passed: 171 },
  { subject: 'Sinh', excellent: 40, good: 75, average: 60, poor: 16, totalStudents: 191, averageScore: 7.1, passed: 175 },
  { subject: 'Sử', excellent: 37, good: 80, average: 62, poor: 12, totalStudents: 191, averageScore: 7.0, passed: 179 },
  { subject: 'Địa', excellent: 43, good: 73, average: 57, poor: 18, totalStudents: 191, averageScore: 7.0, passed: 173 },
  { subject: 'Đạo Đức', excellent: 65, good: 90, average: 30, poor: 6, totalStudents: 191, averageScore: 7.8, passed: 185 },
  { subject: 'Thể Dục', excellent: 58, good: 85, average: 40, poor: 8, totalStudents: 191, averageScore: 7.6, passed: 183 },
];

export function SubjectReport() {
  const [selectedSemester, setSelectedSemester] = useState('HK1-2024-2025');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  const chartData = MOCK_DATA.map(item => ({
    name: item.subject,
    'Xuất sắc': item.excellent,
    'Giỏi': item.good,
    'Trung bình': item.average,
    'Yếu': item.poor
  }));

  const MOCK_CLASSES = ['10A1', '10A2', '10A3', '10A4', '11A1', '11A2', '11A3', '12A1', '12A2'];

  const getClassesByGrade = () => {
    if (selectedGrade === 'all') return MOCK_CLASSES;
    return MOCK_CLASSES.filter(cls => cls.startsWith(selectedGrade));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          <h1 className="text-indigo-900">Báo cáo tổng kết môn học</h1>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Học kỳ</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="HK1-2024-2025">Học kỳ I - 2024-2025</option>
              <option value="HK2-2024-2025">Học kỳ II - 2024-2025</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Khối lớp</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedClass('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Lớp</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả lớp</option>
              {getClassesByGrade().map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-gray-900 mb-4">Biểu đồ phân bố kết quả học tập (9 môn)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Xuất sắc" fill="#10b981" />
              <Bar dataKey="Giỏi" fill="#3b82f6" />
              <Bar dataKey="Trung bình" fill="#f59e0b" />
              <Bar dataKey="Yếu" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-700">Môn học</th>
              <th className="px-6 py-4 text-left text-gray-700">Tổng HS</th>
              <th className="px-6 py-4 text-left text-gray-700">Xuất sắc</th>
              <th className="px-6 py-4 text-left text-gray-700">Giỏi</th>
              <th className="px-6 py-4 text-left text-gray-700">Trung bình</th>
              <th className="px-6 py-4 text-left text-gray-700">Yếu</th>
              <th className="px-6 py-4 text-left text-gray-700">Tỉ lệ đạt</th>
              <th className="px-6 py-4 text-left text-gray-700">ĐTB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {MOCK_DATA.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{item.subject}</td>
                <td className="px-6 py-4 text-gray-600">{item.totalStudents}</td>
                <td className="px-6 py-4">
                  <span className="text-green-700">
                    {item.excellent} ({((item.excellent / item.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-blue-700">
                    {item.good} ({((item.good / item.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-yellow-700">
                    {item.average} ({((item.average / item.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-red-700">
                    {item.poor} ({((item.poor / item.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-green-900">
                    {item.passed} ({((item.passed / item.totalStudents) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{item.averageScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}