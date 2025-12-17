import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, Download } from 'lucide-react';

interface ClassReportData {
  className: string;
  totalStudents: number;
  excellent: number;
  good: number;
  average: number;
  poor: number;
  averageScore: number;
  passed: number; // Số học sinh đạt
}

const MOCK_CLASS_DATA: ClassReportData[] = [
  { className: '10A1', totalStudents: 42, excellent: 8, good: 18, average: 13, poor: 3, averageScore: 7.5, passed: 39 },
  { className: '10A2', totalStudents: 40, excellent: 6, good: 16, average: 15, poor: 3, averageScore: 7.2, passed: 37 },
  { className: '10A3', totalStudents: 41, excellent: 9, good: 19, average: 11, poor: 2, averageScore: 7.6, passed: 39 },
  { className: '10A4', totalStudents: 38, excellent: 7, good: 15, average: 13, poor: 3, averageScore: 7.3, passed: 35 },
  { className: '11A1', totalStudents: 38, excellent: 7, good: 15, average: 13, poor: 3, averageScore: 7.3, passed: 35 },
  { className: '11A2', totalStudents: 39, excellent: 8, good: 17, average: 12, poor: 2, averageScore: 7.4, passed: 37 },
  { className: '11A3', totalStudents: 37, excellent: 6, good: 14, average: 14, poor: 3, averageScore: 7.1, passed: 34 },
  { className: '12A1', totalStudents: 35, excellent: 9, good: 16, average: 9, poor: 1, averageScore: 7.7, passed: 34 },
  { className: '12A2', totalStudents: 36, excellent: 8, good: 15, average: 10, poor: 3, averageScore: 7.5, passed: 33 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export function SemesterReport() {
  const [selectedSemester, setSelectedSemester] = useState('HK1-2024-2025');
  const [selectedClass, setSelectedClass] = useState('all');

  const filteredData = selectedClass === 'all' 
    ? MOCK_CLASS_DATA 
    : MOCK_CLASS_DATA.filter(item => item.className === selectedClass);

  const totalStats = filteredData.reduce((acc, curr) => ({
    totalStudents: acc.totalStudents + curr.totalStudents,
    excellent: acc.excellent + curr.excellent,
    good: acc.good + curr.good,
    average: acc.average + curr.average,
    poor: acc.poor + curr.poor
  }), { totalStudents: 0, excellent: 0, good: 0, average: 0, poor: 0 });

  const pieData = [
    { name: 'Xuất sắc', value: totalStats.excellent },
    { name: 'Giỏi', value: totalStats.good },
    { name: 'Trung bình', value: totalStats.average },
    { name: 'Yếu', value: totalStats.poor }
  ];

  const barData = filteredData.map(item => ({
    name: item.className,
    'Điểm TB': item.averageScore
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          <h1 className="text-indigo-900">Báo cáo tổng kết học kỳ</h1>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            <label className="block text-gray-700 mb-2">Lớp</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả lớp</option>
              {MOCK_CLASS_DATA.map(cls => (
                <option key={cls.className} value={cls.className}>{cls.className}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-green-700 mb-1">Xuất sắc</p>
            <p className="text-green-900">{totalStats.excellent} ({totalStats.totalStudents > 0 ? ((totalStats.excellent / totalStats.totalStudents) * 100).toFixed(1) : 0}%)</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-blue-700 mb-1">Giỏi</p>
            <p className="text-blue-900">{totalStats.good} ({totalStats.totalStudents > 0 ? ((totalStats.good / totalStats.totalStudents) * 100).toFixed(1) : 0}%)</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <p className="text-yellow-700 mb-1">Trung bình</p>
            <p className="text-yellow-900">{totalStats.average} ({totalStats.totalStudents > 0 ? ((totalStats.average / totalStats.totalStudents) * 100).toFixed(1) : 0}%)</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <p className="text-red-700 mb-1">Yếu</p>
            <p className="text-red-900">{totalStats.poor} ({totalStats.totalStudents > 0 ? ((totalStats.poor / totalStats.totalStudents) * 100).toFixed(1) : 0}%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-900 mb-4 text-center">Phân bố xếp loại học sinh</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-gray-900 mb-4 text-center">Điểm trung bình theo lớp</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="Điểm TB" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-700">Lớp</th>
              <th className="px-6 py-4 text-left text-gray-700">Sĩ số</th>
              <th className="px-6 py-4 text-left text-gray-700">Xuất sắc</th>
              <th className="px-6 py-4 text-left text-gray-700">Giỏi</th>
              <th className="px-6 py-4 text-left text-gray-700">Trung bình</th>
              <th className="px-6 py-4 text-left text-gray-700">Yếu</th>
              <th className="px-6 py-4 text-left text-gray-700">Tỉ lệ đạt</th>
              <th className="px-6 py-4 text-left text-gray-700">ĐTB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{item.className}</td>
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