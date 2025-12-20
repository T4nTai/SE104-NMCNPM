import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { api } from '../../api/client';

// Date helpers
function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function isValidDateString(s?: string) {
  if (!s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

function toYMD(s?: string): string {
  if (!s) return '';
  // If already in YYYY-MM-DD, keep it
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateDisplay(s?: string): string {
  if (!s) return '-';
  if (!isValidDateString(s)) {
    // Show raw YYYY-MM-DD if available, otherwise '-'
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '-';
  }
  return new Date(s).toLocaleDateString('vi-VN');
}

// Interfaces for Semester
interface Semester {
  MaHK?: number;
  id?: string;
  TenHK?: string;
  name?: string;
  MaNamHoc?: number;
  NamHoc?: { MaNH: number; Nam1: number; Nam2: number };
  namHoc?: { MaNH: number; Nam1: number; Nam2: number };
  NgayBatDau?: string;
  startDate?: string;
  NgayKetThuc?: string;
  endDate?: string;
  year?: string;
}

// Interfaces for Subject
interface Subject {
  MaMonHoc?: number;
  id?: string;
  TenMonHoc?: string;
  name?: string;
  MaMon?: string;
  code?: string;
  HeSoMon?: number;
  heSoMon?: number;
  MoTa?: string;
  description?: string;
}

// Interfaces for Grade (Class Level)
interface Grade {
  MaKL?: number;
  id?: string;
  TenKL?: string;
  name?: string;
  SoLop?: number;
  classCount?: number;
}

type TabType = 'semesters' | 'subjects' | 'grades';

export function RegulationManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('semesters');
  const [semesterFilterYear, setSemesterFilterYear] = useState<string>('');

  // Semester states
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [semesterError, setSemesterError] = useState<string | null>(null);
  const [semesterFormData, setSemesterFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    year: '',
  });

  // Subject states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    heSoMon: 1,
    description: ''
  });

  // Grade states
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeFormData, setGradeFormData] = useState({
    name: '',
    classCount: 0,
  });

  // Fetch semesters on mount
  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setSemesterLoading(true);
      setSemesterError(null);
      const params = semesterFilterYear.trim()
        ? { NamHoc: semesterFilterYear.trim() }
        : undefined;
      const data = await api.listSemesters(params);
      const normalized = (data || []).map((r: any) => {
        const nh = r?.NamHoc || r?.namHoc;
        return {
          ...r,
          year: nh ? `${nh.Nam1}-${nh.Nam2}` : r?.year,
          startDate: toYMD(r?.NgayBatDau || r?.startDate),
          endDate: toYMD(r?.NgayKetThuc || r?.endDate),
        };
      });
      setSemesters(normalized);
    } catch (err: any) {
      setSemesterError(err.message || 'Không thể tải danh sách học kỳ');
    } finally {
      setSemesterLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setSubjectLoading(true);
      setSubjectError(null);
      const data = await api.listSubjects();
      setSubjects(data);
    } catch (err: any) {
      setSubjectError(err.message || 'Không thể tải danh sách môn học');
    } finally {
      setSubjectLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      setGradeLoading(true);
      setGradeError(null);
      const data = await api.listGrades();
      setGrades(data);
    } catch (err: any) {
      setGradeError(err.message || 'Không thể tải danh sách khối lớp');
    } finally {
      setGradeLoading(false);
    }
  };

  // Semester handlers
  const handleSubmitSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setSemesterError(null);
    
    try {
      const NamHocText = (semesterFormData.year || '').trim();
      if (!NamHocText) {
        throw new Error('Vui lòng nhập năm học (ví dụ: 2024-2025)');
      }
      const isValidYear = /^\d{4}-\d{4}$/.test(NamHocText);
      if (!isValidYear) {
        throw new Error('Định dạng năm học phải là YYYY-YYYY (vd: 2024-2025)');
      }
      const [y1, y2] = NamHocText.split('-').map(Number);
      if (!(y2 === y1 + 1)) {
        throw new Error('Năm học phải liên tiếp (vd: 2024-2025)');
      }
      // Optional: validate date range when both provided
      const sd = semesterFormData.startDate?.trim();
      const ed = semesterFormData.endDate?.trim();
      if (sd && ed) {
        if (!isValidDateString(sd) || !isValidDateString(ed)) {
          throw new Error('Ngày bắt đầu/kết thúc không hợp lệ');
        }
        const sDate = new Date(sd);
        const eDate = new Date(ed);
        if (sDate > eDate) {
          throw new Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc');
        }
      }
      const payload = {
        TenHK: semesterFormData.name,
        NgayBatDau: toYMD(semesterFormData.startDate) || undefined,
        NgayKetThuc: toYMD(semesterFormData.endDate) || undefined,
        NamHoc: NamHocText,
      };

      if (editingSemesterId) {
        await api.updateSemester(editingSemesterId, payload);
      } else {
        await api.createSemester(payload);
      }
      
      setIsAddingSemester(false);
      setEditingSemesterId(null);
      setSemesterFormData({
        name: '',
        startDate: '',
        endDate: '',
        year: '',
      });
      await fetchSemesters();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      setSemesterError(serverMsg || err.message || 'Không thể lưu học kỳ');
    }
  };

  const handleEditSemester = (semester: Semester) => {
    setEditingSemesterId(String(semester.MaHK || semester.id || ''));
    const nh = semester.NamHoc || semester.namHoc;
    setSemesterFormData({
      name: semester.TenHK || semester.name || '',
      startDate: toYMD(semester.NgayBatDau || semester.startDate),
      endDate: toYMD(semester.NgayKetThuc || semester.endDate),
      year: nh ? `${nh.Nam1}-${nh.Nam2}` : String(semester.year || ''),
    });
    setIsAddingSemester(true);
  };

  const handleDeleteSemester = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học kỳ này?')) {
      try {
        setSemesterError(null);
        await api.deleteSemester(id);
        await fetchSemesters();
      } catch (err: any) {
        setSemesterError(err.message || 'Không thể xóa học kỳ');
      }
    }
  };

  const handleCancelSemester = () => {
    setIsAddingSemester(false);
    setEditingSemesterId(null);
    setSemesterFormData({
      name: '',
      startDate: '',
      endDate: '',
      year: '',
    });
  };

  // Subject handlers
  const handleSubmitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubjectError(null);
    
    try {
      const payload = {
        TenMonHoc: subjectFormData.name,
        MaMon: subjectFormData.code || undefined,
        HeSoMon: subjectFormData.heSoMon,
        MoTa: subjectFormData.description || undefined
      };

      if (editingSubjectId) {
        await api.updateSubject(editingSubjectId, payload);
      } else {
        await api.createSubject(payload);
      }
      
      setIsAddingSubject(false);
      setEditingSubjectId(null);
      setSubjectFormData({
        name: '',
        code: '',
        heSoMon: 1,
        description: ''
      });
      await fetchSubjects();
    } catch (err: any) {
      setSubjectError(err.message || 'Không thể lưu môn học');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(String(subject.MaMonHoc || subject.id || ''));
    setSubjectFormData({
      name: subject.TenMonHoc || subject.name || '',
      code: subject.MaMon || subject.code || '',
      heSoMon: subject.HeSoMon || subject.heSoMon || 1,
      description: subject.MoTa || subject.description || ''
    });
    setIsAddingSubject(true);
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      try {
        setSubjectError(null);
        await api.deleteSubject(id);
        await fetchSubjects();
      } catch (err: any) {
        setSubjectError(err.message || 'Không thể xóa môn học');
      }
    }
  };

  const handleCancelSubject = () => {
    setIsAddingSubject(false);
    setEditingSubjectId(null);
    setSubjectFormData({
      name: '',
      code: '',
      heSoMon: 1,
      description: ''
    });
  };

  // Grade handlers
  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradeError(null);
    
    try {
      const payload = {
        TenKL: gradeFormData.name,
        SoLop: gradeFormData.classCount || undefined
      };

      if (editingGradeId) {
        await api.updateGrade(editingGradeId, payload);
      } else {
        await api.createGrade(payload);
      }
      
      setIsAddingGrade(false);
      setEditingGradeId(null);
      setGradeFormData({
        name: '',
        classCount: 0,
      });
      await fetchGrades();
    } catch (err: any) {
      setGradeError(err.message || 'Không thể lưu khối lớp');
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGradeId(String(grade.MaKL || grade.id || ''));
    setGradeFormData({
      name: grade.TenKL || grade.name || '',
      classCount: grade.SoLop || grade.classCount || 0,
    });
    setIsAddingGrade(true);
  };

  const handleDeleteGrade = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khối lớp này?')) {
      try {
        setGradeError(null);
        await api.deleteGrade(id);
        await fetchGrades();
      } catch (err: any) {
        setGradeError(err.message || 'Không thể xóa khối lớp');
      }
    }
  };

  const handleCancelGrade = () => {
    setIsAddingGrade(false);
    setEditingGradeId(null);
    setGradeFormData({
      name: '',
      classCount: 0,
    });
  };

  return (
    <div>
      <h1 className="text-blue-900 mb-6">Thay đổi quy định</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('semesters');
            fetchSemesters();
          }}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'semesters'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Học kỳ
        </button>
        <button
          onClick={() => {
            setActiveTab('subjects');
            fetchSubjects();
          }}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'subjects'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Môn học
        </button>
        <button
          onClick={() => {
            setActiveTab('grades');
            fetchGrades();
          }}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'grades'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Khối lớp
        </button>
      </div>

      {/* Semester Tab Content */}
      {activeTab === 'semesters' && (
        <div>
          {semesterError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              Lỗi: {semesterError}
            </div>
          )}

          {semesterLoading && <div className="text-blue-600 mb-4">Đang tải dữ liệu...</div>}

          <div className="flex justify-end items-center mb-6">
            {!isAddingSemester && (
              <button
                onClick={() => setIsAddingSemester(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Thêm học kỳ
              </button>
            )}
          </div>

          {isAddingSemester && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-blue-900 mb-4">
                {editingSemesterId ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ mới'}
              </h2>
              <form onSubmit={handleSubmitSemester}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Tên học kỳ</label>
                    <input
                      type="text"
                      required
                      value={semesterFormData.name || ''}
                      onChange={(e) => setSemesterFormData({ ...semesterFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Học kỳ I"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Năm học</label>
                    <input
                      type="text"
                      required
                      value={semesterFormData.year || ''}
                      onChange={(e) => setSemesterFormData({ ...semesterFormData, year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2024-2025"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={semesterFormData.startDate || ''}
                      onChange={(e) => setSemesterFormData({ ...semesterFormData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      required
                      value={semesterFormData.endDate || ''}
                      onChange={(e) => setSemesterFormData({ ...semesterFormData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                    {editingSemesterId ? 'Cập nhật' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSemester}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={semesterFilterYear}
                  onChange={(e) => setSemesterFilterYear(e.target.value)}
                  placeholder="Lọc theo năm học (vd: 2024-2025)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                  onClick={fetchSemesters}
                >
                  Lọc
                </button>
                <button
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
                  onClick={() => { setSemesterFilterYear(''); fetchSemesters(); }}
                >
                  Xóa lọc
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Tên học kỳ</th>
                  <th className="px-6 py-3 text-left text-gray-700">Năm học</th>
                  <th className="px-6 py-3 text-left text-gray-700">Thời gian</th>
                  <th className="px-6 py-3 text-left text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {semesters.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  semesters.map((semester) => (
                    <tr key={semester.MaHK || semester.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{semester.TenHK || semester.name}</td>
                      <td className="px-6 py-4 text-gray-900">{(semester.NamHoc || semester.namHoc) ? `${(semester.NamHoc || semester.namHoc)!.Nam1}-${(semester.NamHoc || semester.namHoc)!.Nam2}` : (semester.year || '-')}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDateDisplay(semester.NgayBatDau || semester.startDate)} - {formatDateDisplay(semester.NgayKetThuc || semester.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSemester(semester)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSemester(String(semester.MaHK || semester.id || ''))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Tab Content */}
      {activeTab === 'subjects' && (
        <div>
          {subjectError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              Lỗi: {subjectError}
            </div>
          )}

          {subjectLoading && <div className="text-blue-600 mb-4">Đang tải dữ liệu...</div>}

          <div className="flex justify-end items-center mb-6">
            {!isAddingSubject && (
              <button
                onClick={() => setIsAddingSubject(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Thêm môn học
              </button>
            )}
          </div>

          {isAddingSubject && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-blue-900 mb-4">
                {editingSubjectId ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
              </h2>
              <form onSubmit={handleSubmitSubject}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Tên môn học</label>
                    <input
                      type="text"
                      required
                      value={subjectFormData.name || ''}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Toán"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Mã môn học</label>
                    <input
                      type="text"
                      required
                      value={subjectFormData.code || ''}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="TOAN"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Hệ số môn</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="3"
                      step="1"
                      value={subjectFormData.heSoMon || 1}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, heSoMon: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Mô tả</label>
                    <input
                      type="text"
                      value={subjectFormData.description || ''}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mô tả môn học"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                    {editingSubjectId ? 'Cập nhật' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSubject}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Mã môn</th>
                  <th className="px-6 py-3 text-left text-gray-700">Tên môn học</th>
                  <th className="px-6 py-3 text-left text-gray-700">Hệ số môn</th>
                  <th className="px-6 py-3 text-left text-gray-700">Mô tả</th>
                  <th className="px-6 py-3 text-left text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject.MaMonHoc || subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{subject.MaMon || subject.code || '-'}</td>
                      <td className="px-6 py-4 text-gray-900">{subject.TenMonHoc || subject.name}</td>
                      <td className="px-6 py-4 text-gray-900">{subject.HeSoMon || subject.heSoMon}</td>
                      <td className="px-6 py-4 text-gray-600">{subject.MoTa || subject.description || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(String(subject.MaMonHoc || subject.id || ''))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Tab Content */}
      {activeTab === 'grades' && (
        <div>
          {gradeError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              Lỗi: {gradeError}
            </div>
          )}

          {gradeLoading && <div className="text-blue-600 mb-4">Đang tải dữ liệu...</div>}

          <div className="flex justify-end items-center mb-6">
            {!isAddingGrade && (
              <button
                onClick={() => setIsAddingGrade(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Thêm khối lớp
              </button>
            )}
          </div>

          {isAddingGrade && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h2 className="text-blue-900 mb-4">
                {editingGradeId ? 'Chỉnh sửa khối lớp' : 'Thêm khối lớp mới'}
              </h2>
              <form onSubmit={handleSubmitGrade}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Tên khối</label>
                    <input
                      type="text"
                      required
                      value={gradeFormData.name || ''}
                      onChange={(e) => setGradeFormData({ ...gradeFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Khối 10"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Số lượng lớp</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={gradeFormData.classCount || 0}
                      onChange={(e) => setGradeFormData({ ...gradeFormData, classCount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                    {editingGradeId ? 'Cập nhật' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelGrade}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Tên khối</th>
                  <th className="px-6 py-3 text-left text-gray-700">Số lớp</th>
                  <th className="px-6 py-3 text-left text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  grades.map((grade) => (
                    <tr key={grade.MaKL || grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{grade.TenKL || grade.name}</td>
                      <td className="px-6 py-4 text-gray-900">{grade.SoLop || grade.classCount || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditGrade(grade)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(String(grade.MaKL || grade.id || ''))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}