import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../api/client';
import { ClassInfo, StudentInClass } from '../../api/types';

interface ScoreDetail {
  MaLHKT?: string; // Loại hình kiểm tra (e.g., "1" for mieng15Phut, "2" for mot1Tiet)
  Lan?: number; // Lần (occurrence number)
  Diem?: number; // Điểm
  giuaKy?: string;
  cuoiKy?: string;
}

interface GradeEntry {
  MaHocSinh: string;
  HoTen: string;
  scores: {
    mieng15Phut: string;
    mot1Tiet: string;
    giuaKy: string;
    cuoiKy: string;
  };
  average: number | null;
}

export function GradeEntry() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('HK1');
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSavingStatus] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTeacherClasses()
      .then((data) => {
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Populate grades when class changes
  useEffect(() => {
    if (selectedClass?.DanhSachHocSinh) {
      const gradeEntries: GradeEntry[] = selectedClass.DanhSachHocSinh.map((student: StudentInClass) => ({
        MaHocSinh: student.MaHocSinh,
        HoTen: student.HoTen,
        scores: {
          mieng15Phut: '',
          mot1Tiet: '',
          giuaKy: '',
          cuoiKy: ''
        },
        average: null
      }));
      setGrades(gradeEntries);
    }
  }, [selectedClass]);

  const parseScores = (scoreString: string): number[] => {
    if (!scoreString.trim()) return [];
    return scoreString.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  };

  const calculateAverage = (entry: GradeEntry): number | null => {
    const giuaKy = parseFloat(entry.scores.giuaKy);
    const cuoiKy = parseFloat(entry.scores.cuoiKy);
    
    if (isNaN(giuaKy) || isNaN(cuoiKy)) return null;
    
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

  const handleScoreChange = (studentId: string, field: keyof GradeEntry['scores'], value: string) => {
    setGrades(grades.map(g => {
      if (g.MaHocSinh === studentId) {
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

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !selectedSemester) {
      alert('Vui lòng chọn lớp, môn học và học kỳ');
      return;
    }

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
    
    try {
      setSavingStatus(true);
      setError(null);

      // Construct scores array with test type details
      const scoresArray = grades
        .filter(g => g.scores.giuaKy.trim() || g.scores.cuoiKy.trim())
        .map(g => ({
          MaHocSinh: g.MaHocSinh,
          details: [
            ...(g.scores.mieng15Phut.trim() 
              ? parseScores(g.scores.mieng15Phut).map((score, idx) => ({
                  MaLHKT: '1',
                  Lan: idx + 1,
                  Diem: score
                }))
              : []
            ),
            ...(g.scores.mot1Tiet.trim()
              ? parseScores(g.scores.mot1Tiet).map((score, idx) => ({
                  MaLHKT: '2',
                  Lan: idx + 1,
                  Diem: score
                }))
              : []
            ),
            ...(g.scores.giuaKy.trim()
              ? [{ MaLHKT: '3', Lan: 1, Diem: parseFloat(g.scores.giuaKy) }]
              : []
            ),
            ...(g.scores.cuoiKy.trim()
              ? [{ MaLHKT: '4', Lan: 1, Diem: parseFloat(g.scores.cuoiKy) }]
              : []
            )
          ]
        }));

      await api.enterGradebook({
        MaLop: selectedClass.MaLop,
        MaHocKy: selectedSemester,
        MaMon: selectedSubject,
        scores: scoresArray
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu bảng điểm');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div>
      <h1 className="text-green-900 mb-6">Nhập bảng điểm môn học</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Đã lưu bảng điểm thành công!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          Lỗi: {error}
        </div>
      )}

      {loading && <div className="text-green-600 mb-4">Đang tải dữ liệu...</div>}

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Lớp</label>
            <select
              value={selectedClass?.MaLop || ''}
              onChange={(e) => {
                const selected = classes.find(c => c.MaLop === e.target.value);
                setSelectedClass(selected || null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((cls) => (
                <option key={cls.MaLop} value={cls.MaLop}>
                  {cls.TenLop}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Môn học</label>
            <input
              type="text"
              placeholder="VD: Toán, Văn, Lý..."
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
              {grades.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Chọn lớp để xem danh sách học sinh
                  </td>
                </tr>
              ) : (
                grades.map((entry, index) => (
                  <tr key={entry.MaHocSinh} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 border-r">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-900 border-r">{entry.MaHocSinh}</td>
                    <td className="px-4 py-3 text-gray-900 border-r">{entry.HoTen}</td>
                    
                    {/* Điểm Miệng/15' */}
                    <td className="px-4 py-3 border-r bg-blue-50">
                      <input
                        type="text"
                        value={entry.scores.mieng15Phut}
                        onChange={(e) => handleScoreChange(entry.MaHocSinh, 'mieng15Phut', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8, 7.5, 9"
                      />
                    </td>

                    {/* Điểm 1 Tiết */}
                    <td className="px-4 py-3 border-r bg-purple-50">
                      <input
                        type="text"
                        value={entry.scores.mot1Tiet}
                        onChange={(e) => handleScoreChange(entry.MaHocSinh, 'mot1Tiet', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="8, 7"
                      />
                    </td>

                    {/* Điểm Giữa kỳ */}
                    <td className="px-4 py-3 border-r bg-yellow-50">
                      <input
                        type="text"
                        value={entry.scores.giuaKy}
                        onChange={(e) => handleScoreChange(entry.MaHocSinh, 'giuaKy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="7.5"
                      />
                    </td>

                    {/* Điểm Cuối kỳ */}
                    <td className="px-4 py-3 border-r bg-orange-50">
                      <input
                        type="text"
                        value={entry.scores.cuoiKy}
                        onChange={(e) => handleScoreChange(entry.MaHocSinh, 'cuoiKy', e.target.value)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Đang lưu...' : 'Lưu bảng điểm'}
        </button>
      </div>
    </div>
  );
}