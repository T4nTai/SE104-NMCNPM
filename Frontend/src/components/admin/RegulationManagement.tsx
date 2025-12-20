import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { api } from '../../api/client';

export function RegulationManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Semester states
  const [semesters, setSemesters] = useState<any[]>([]);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<number | null>(null);
  const [semesterFormData, setSemesterFormData] = useState({
    TenHK: '',
  });

  // Subject states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    TenMonHoc: '',
    HeSoMon: 1,
    MoTa: ''
  });

  // Grade states
  const [grades, setGrades] = useState<any[]>([]);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [gradeFormData, setGradeFormData] = useState({
    TenKL: '',
    SoLop: 0,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadSemesters(), loadSubjects(), loadGrades()]);
  };

  const loadSemesters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listSemesters();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listGrades();
      setGrades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khối lớp');
    } finally {
      setLoading(false);
    }
  };

  // Semester handlers
  const handleSubmitSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (editingSemesterId) {
        await api.updateSemester(String(editingSemesterId), semesterFormData);
        setEditingSemesterId(null);
      } else {
        if (semesters.length >= 2) {
          setError('Chỉ được phép có 2 học kỳ (Học kỳ I và Học kỳ II)');
          return;
        }
        await api.createSemester(semesterFormData);
      }

      setSuccess(true);
      setIsAddingSemester(false);
      setSemesterFormData({
        TenHK: '',
      });
      await loadSemesters();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể lưu học kỳ');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSemester = (semester: any) => {
    setEditingSemesterId(semester.MaHK);
    setSemesterFormData({
      TenHK: semester.TenHK,
    });
    setIsAddingSemester(true);
  };

  const handleDeleteSemester = async (MaHK: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học kỳ này?')) return;

    try {
      setLoading(true);
      setError(null);
      await api.deleteSemester(String(MaHK));
      setSuccess(true);
      await loadSemesters();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể xóa học kỳ');
    } finally {
      setLoading(false);
    }
  };

  // Subject handlers
  const handleSubmitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (editingSubjectId) {
        await api.updateSubject(String(editingSubjectId), subjectFormData);
        setEditingSubjectId(null);
      } else {
        await api.createSubject(subjectFormData);
      }

      setSuccess(true);
      setIsAddingSubject(false);
      setSubjectFormData({
        TenMonHoc: '',
        HeSoMon: 1,
        MoTa: ''
      });
      await loadSubjects();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể lưu môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubjectId(subject.MaMonHoc);
    setSubjectFormData({
      TenMonHoc: subject.TenMonHoc,
      HeSoMon: subject.HeSoMon,
      MoTa: subject.MoTa || ''
    });
    setIsAddingSubject(true);
  };

  const handleDeleteSubject = async (MaMonHoc: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa môn học này?')) return;

    try {
      setLoading(true);
      setError(null);
      await api.deleteSubject(String(MaMonHoc));
      setSuccess(true);
      await loadSubjects();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể xóa môn học');
    } finally {
      setLoading(false);
    }
  };

  // Grade handlers
  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (editingGradeId) {
        await api.updateGrade(String(editingGradeId), gradeFormData);
        setEditingGradeId(null);
      } else {
        if (grades.length >= 3) {
          setError('Chỉ được phép có 3 khối lớp (10, 11, 12)');
          return;
        }
        await api.createGrade(gradeFormData);
      }

      setSuccess(true);
      setIsAddingGrade(false);
      setGradeFormData({
        TenKL: '',
        SoLop: 0,
      });
      await loadGrades();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể lưu khối lớp');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGrade = (grade: any) => {
    setEditingGradeId(grade.MaKL);
    setGradeFormData({
      TenKL: grade.TenKL,
      SoLop: grade.SoLop || 0,
    });
    setIsAddingGrade(true);
  };

  const handleDeleteGrade = async (MaKL: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khối lớp này?')) return;

    try {
      setLoading(true);
      setError(null);
      await api.deleteGrade(String(MaKL));
      setSuccess(true);
      await loadGrades();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể xóa khối lớp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-indigo-900 mb-6">Quản lý quy định</h1>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Thao tác thành công!
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* SEMESTERS SECTION */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Quản lý học kỳ</h2>
              {!isAddingSemester && semesters.length < 2 && (
                <button
                  onClick={() => setIsAddingSemester(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                  Thêm học kỳ
                </button>
              )}
            </div>

            {isAddingSemester && (
              <form onSubmit={handleSubmitSemester} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Tên học kỳ *</label>
                  <input
                    type="text"
                    value={semesterFormData.TenHK}
                    onChange={(e) => setSemesterFormData({ TenHK: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ví dụ: Học kỳ I"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingSemesterId ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSemester(false);
                      setEditingSemesterId(null);
                      setSemesterFormData({ TenHK: '' });
                    }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {semesters.map((semester) => (
                <div key={semester.MaHK} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-gray-900">{semester.TenHK}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSemester(semester)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSemester(semester.MaHK)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {semesters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có học kỳ nào. Nhấn "Thêm học kỳ" để bắt đầu.
                </div>
              )}
            </div>
          </div>

          {/* SUBJECTS SECTION */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Quản lý môn học</h2>
              {!isAddingSubject && (
                <button
                  onClick={() => setIsAddingSubject(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                  Thêm môn học
                </button>
              )}
            </div>

            {isAddingSubject && (
              <form onSubmit={handleSubmitSubject} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Tên môn học *</label>
                    <input
                      type="text"
                      value={subjectFormData.TenMonHoc}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, TenMonHoc: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ví dụ: Toán"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Hệ số môn *</label>
                    <input
                      type="number"
                      value={subjectFormData.HeSoMon}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, HeSoMon: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      min="1"
                      step="0.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      value={subjectFormData.MoTa}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, MoTa: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingSubjectId ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSubject(false);
                      setEditingSubjectId(null);
                      setSubjectFormData({ TenMonHoc: '', HeSoMon: 1, MoTa: '' });
                    }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {subjects.map((subject) => (
                <div key={subject.MaMonHoc} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-gray-900">{subject.TenMonHoc}</div>
                    <div className="text-sm text-gray-600">
                      Hệ số: {subject.HeSoMon}
                      {subject.MoTa && ` • ${subject.MoTa}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubject(subject)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.MaMonHoc)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có môn học nào. Nhấn "Thêm môn học" để bắt đầu.
                </div>
              )}
            </div>
          </div>

          {/* GRADES SECTION */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Quản lý khối lớp</h2>
              {!isAddingGrade && grades.length < 3 && (
                <button
                  onClick={() => setIsAddingGrade(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                  Thêm khối lớp
                </button>
              )}
            </div>

            {isAddingGrade && (
              <form onSubmit={handleSubmitGrade} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Tên khối lớp *</label>
                    <input
                      type="text"
                      value={gradeFormData.TenKL}
                      onChange={(e) => setGradeFormData({ ...gradeFormData, TenKL: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ví dụ: 10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Số lớp</label>
                    <input
                      type="number"
                      value={gradeFormData.SoLop}
                      onChange={(e) => setGradeFormData({ ...gradeFormData, SoLop: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingGradeId ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingGrade(false);
                      setEditingGradeId(null);
                      setGradeFormData({ TenKL: '', SoLop: 0 });
                    }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {grades.map((grade) => (
                <div key={grade.MaKL} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-gray-900">Khối {grade.TenKL}</div>
                    <div className="text-sm text-gray-600">Số lớp: {grade.SoLop || 0}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGrade(grade)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGrade(grade.MaKL)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {grades.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có khối lớp nào. Nhấn "Thêm khối lớp" để bắt đầu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
