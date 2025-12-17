import { useState } from 'react';
import { Save } from 'lucide-react';

interface ScoreDetail {
  mieng15Phut: string;
  mot1Tiet: string;
  giuaKy: string;
  cuoiKy: string;
}

interface GradeEntry {
  studentId: string;
  studentCode: string;
  studentName: string;
  scores: ScoreDetail;
  average: number | null;
}

const MOCK_STUDENTS: GradeEntry[] = [
  { 
    studentId: '1', 
    studentCode: 'HS001', 
    studentName: 'Nguyễn Văn An', 
    scores: { mieng15Phut: '8, 7.5', mot1Tiet: '8, 7', giuaKy: '7.5', cuoiKy: '8' },
    average: null 
  },
  { 
    studentId: '2', 
    studentCode: 'HS002', 
    studentName: 'Trần Thị Bình', 
    scores: { mieng15Phut: '9, 8.5', mot1Tiet: '9', giuaKy: '8.5', cuoiKy: '9' },
    average: null 
  },
  { 
    studentId: '3', 
    studentCode: 'HS003', 
    studentName: 'Lê Văn Cường', 
    scores: { mieng15Phut: '7, 6.5', mot1Tiet: '7', giuaKy: '6.5', cuoiKy: '7' },
    average: null 
  },
];

export function GradeEntry() {
  const [selectedClass, setSelectedClass] = useState('10A1');
  const [selectedSubject, setSelectedSubject] = useState('Toán');
  const [selectedSemester, setSelectedSemester] = useState('HK1-2024-2025');
  const [grades, setGrades] = useState<GradeEntry[]>(MOCK_STUDENTS);
  const [saved, setSaved] = useState(false);

  const parseScores = (scoreString: string): number[] => {
    if (!scoreString.trim()) return [];
    return scoreString.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  };

  const calculateAverage = (entry: GradeEntry): number | null => {
    const giuaKy = parseFloat(entry.scores.giuaKy);
    const cuoiKy = parseFloat(entry.scores.cuoiKy);
    
    if (isNaN(giuaKy) || isNaN(cuoiKy)) return null;
    
    // Công thức: (Điểm thi cuối kỳ*3 + Điểm thi giữa kỳ*3 + ĐTB kiểm tra 1 Tiết *2 + ĐTB kiểm tra Miệng/15' ) / 9
    const mieng15Scores = parseScores(entry.scores.mieng15Phut);
    const tiet1Scores = parseScores(entry.scores.mot1Tiet);
    
    const mieng15Avg = mieng15Scores.length > 0 
      ? mieng15Scores.reduce((a, b) => a + b, 0) / mieng15Scores.length 
      : 0;
    const tiet1Avg = tiet1Scores.length > 0 
      ? tiet1Scores.reduce((a, b) => a + b, 0) / tiet1Scores.length 
      : 0;
    
    const average = (cuoiKy * 3 + giuaKy * 3 + tiet1Avg * 2 + mieng15Avg) / 9;
    return Math.round(average * 10) / 10;
  };

  const handleScoreChange = (studentId: string, field: keyof ScoreDetail, value: string) => {
    setGrades(grades.map(g => {
      if (g.studentId === studentId) {
        const updated = { 
          ...g, 
          scores: { ...g.scores, [field]: value }
        };
        updated.average = calculateAverage(updated);
        return updated;
      }
      return g;
    }));
  };

  const handleSave = () => {
    // Kiểm tra tất cả học sinh đã có đủ điểm chưa
    const missingGrades = grades.filter(g => 
      !g.scores.giuaKy.trim() || !g.scores.cuoiKy.trim()
    );
    
    if (missingGrades.length > 0) {
      const confirm = window.confirm(
        `Còn ${missingGrades.length} học sinh chưa có đủ điểm giữa kỳ và cuối kỳ. Bạn có muốn tiếp tục lưu?`
      );
      if (!confirm) return;
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-green-900 mb-6">Nhập bảng điểm môn học</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Đã lưu bảng điểm thành công!
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-gray-700 mb-2">Học kỳ</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="HK1-2024-2025">Học kỳ I - 2024-2025</option>
              <option value="HK2-2024-2025">Học kỳ II - 2024-2025</option>
              <option value="HK1-2023-2024">Học kỳ I - 2023-2024</option>
              <option value="HK2-2023-2024">Học kỳ II - 2023-2024</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <p className="text-blue-900 mb-2">
          <strong>Hướng dẫn nhập điểm:</strong>
        </p>
        <ul className="text-blue-800 text-sm space-y-1 ml-4 list-disc">
          <li>Điểm Miệng/15 phút và 1 Tiết: Nhập nhiều điểm cách nhau bởi dấu phẩy (VD: 8, 7.5, 9)</li>
          <li>Điểm Giữa kỳ và Cuối kỳ: Nhập một điểm duy nhất (VD: 8.5)</li>
          <li>Công thức tính ĐTB Môn: (Cuối kỳ × 3 + Giữa kỳ × 3 + ĐTB 1 Tiết × 2 + ĐTB Miệng/15' × 1) / 9</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 border-r">STT</th>
                <th className="px-4 py-3 text-left text-gray-700 border-r">Mã HS</th>
                <th className="px-4 py-3 text-left text-gray-700 border-r">Họ và tên</th>
                <th className="px-4 py-3 text-center text-gray-700 border-r bg-blue-50">
                  <div>Điểm Miệng/15'</div>
                  <div className="text-xs text-gray-500">(VD: 8, 7.5, 9)</div>
                </th>
                <th className="px-4 py-3 text-center text-gray-700 border-r bg-purple-50">
                  <div>Điểm 1 Tiết</div>
                  <div className="text-xs text-gray-500">(VD: 8, 7)</div>
                </th>
                <th className="px-4 py-3 text-center text-gray-700 border-r bg-yellow-50">
                  <div>Điểm Giữa kỳ</div>
                  <div className="text-xs text-gray-500">(VD: 7.5)</div>
                </th>
                <th className="px-4 py-3 text-center text-gray-700 border-r bg-orange-50">
                  <div>Điểm Cuối kỳ</div>
                  <div className="text-xs text-gray-500">(VD: 8)</div>
                </th>
                <th className="px-4 py-3 text-center text-gray-700 bg-green-50">ĐTB Môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {grades.map((entry, index) => (
                <tr key={entry.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 border-r">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-900 border-r">{entry.studentCode}</td>
                  <td className="px-4 py-3 text-gray-900 border-r">{entry.studentName}</td>
                  
                  {/* Điểm Miệng/15' */}
                  <td className="px-4 py-3 border-r bg-blue-50">
                    <input
                      type="text"
                      value={entry.scores.mieng15Phut}
                      onChange={(e) => handleScoreChange(entry.studentId, 'mieng15Phut', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8, 7.5, 9"
                    />
                  </td>

                  {/* Điểm 1 Tiết */}
                  <td className="px-4 py-3 border-r bg-purple-50">
                    <input
                      type="text"
                      value={entry.scores.mot1Tiet}
                      onChange={(e) => handleScoreChange(entry.studentId, 'mot1Tiet', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="8, 7"
                    />
                  </td>

                  {/* Điểm Giữa kỳ */}
                  <td className="px-4 py-3 border-r bg-yellow-50">
                    <input
                      type="text"
                      value={entry.scores.giuaKy}
                      onChange={(e) => handleScoreChange(entry.studentId, 'giuaKy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="7.5"
                    />
                  </td>

                  {/* Điểm Cuối kỳ */}
                  <td className="px-4 py-3 border-r bg-orange-50">
                    <input
                      type="text"
                      value={entry.scores.cuoiKy}
                      onChange={(e) => handleScoreChange(entry.studentId, 'cuoiKy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="8"
                    />
                  </td>

                  {/* ĐTB Môn */}
                  <td className="px-4 py-3 text-center bg-green-50">
                    <span className={`px-3 py-2 rounded inline-block min-w-[50px] ${
                      entry.average !== null && entry.average >= 8 ? 'bg-green-100 text-green-700' :
                      entry.average !== null && entry.average >= 6.5 ? 'bg-blue-100 text-blue-700' :
                      entry.average !== null && entry.average >= 5 ? 'bg-yellow-100 text-yellow-700' :
                      entry.average !== null ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.average !== null ? entry.average.toFixed(1) : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          <Save className="w-5 h-5" />
          Lưu bảng điểm
        </button>
      </div>
    </div>
  );
}
