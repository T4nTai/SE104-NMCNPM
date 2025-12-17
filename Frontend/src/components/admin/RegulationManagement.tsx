import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

// Interfaces for Semester
interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  year: string;
}

// Interfaces for Subject
interface Subject {
  id: string;
  name: string;
  code: string;
  heSoMon: number;
  description: string;
}

// Interfaces for Grade
interface Grade {
  id: string;
  name: string;
  classCount: number;
}

const MOCK_SEMESTERS: Semester[] = [
  { id: '1', name: 'Học kỳ I', startDate: '2024-09-01', endDate: '2024-12-31', year: '2024-2025' },
  { id: '2', name: 'Học kỳ II', startDate: '2025-01-01', endDate: '2025-05-31', year: '2024-2025' },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: '1', name: 'Toán', code: 'TOAN', heSoMon: 2, description: 'Môn Toán học' },
  { id: '2', name: 'Văn', code: 'VAN', heSoMon: 2, description: 'Môn Ngữ văn' },
  { id: '3', name: 'Lý', code: 'LY', heSoMon: 1, description: 'Môn Vật lý' },
  { id: '4', name: 'Hóa', code: 'HOA', heSoMon: 1, description: 'Môn Hóa học' },
  { id: '5', name: 'Sinh', code: 'SINH', heSoMon: 1, description: 'Môn Sinh học' },
  { id: '6', name: 'Sử', code: 'SU', heSoMon: 1, description: 'Môn Lịch sử' },
  { id: '7', name: 'Địa', code: 'DIA', heSoMon: 1, description: 'Môn Địa lý' },
  { id: '8', name: 'Đạo Đức', code: 'DD', heSoMon: 1, description: 'Môn Đạo đức' },
  { id: '9', name: 'Thể Dục', code: 'TD', heSoMon: 1, description: 'Môn Thể dục' },
];

const MOCK_GRADES: Grade[] = [
  { id: '1', name: 'Khối 10', classCount: 4 },
  { id: '2', name: 'Khối 11', classCount: 3 },
  { id: '3', name: 'Khối 12', classCount: 2 },
];

type TabType = 'semesters' | 'subjects' | 'grades';

export function RegulationManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('semesters');

  // Semester states
  const [semesters, setSemesters] = useState<Semester[]>(MOCK_SEMESTERS);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [semesterFormData, setSemesterFormData] = useState<Omit<Semester, 'id'>>({
    name: '',
    startDate: '',
    endDate: '',
    year: '',
  });

  // Subject states
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectFormData, setSubjectFormData] = useState<Omit<Subject, 'id'>>({
    name: '',
    code: '',
    heSoMon: 1,
    description: ''
  });

  // Grade states
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [gradeFormData, setGradeFormData] = useState<Omit<Grade, 'id'>>({
    name: '',
    classCount: 0,
  });

  // Semester handlers
  const handleSubmitSemester = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSemesterId) {
      setSemesters(semesters.map(s => 
        s.id === editingSemesterId ? { ...semesterFormData, id: editingSemesterId } : s
      ));
      setEditingSemesterId(null);
    } else {
      if (semesters.length >= 2) {
        alert('Chỉ được phép có 2 học kỳ (Học kỳ I và Học kỳ II)');
        return;
      }
      setSemesters([...semesters, { ...semesterFormData, id: Date.now().toString() }]);
      setIsAddingSemester(false);
    }
    
    setSemesterFormData({
      name: '',
      startDate: '',
      endDate: '',
      year: '',
    });
  };

  const handleEditSemester = (semester: Semester) => {
    setEditingSemesterId(semester.id);
    setSemesterFormData(semester);
    setIsAddingSemester(true);
  };

  const handleDeleteSemester = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học kỳ này?')) {
      setSemesters(semesters.filter(s => s.id !== id));
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
  const handleSubmitSubject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubjectId) {
      setSubjects(subjects.map(s => 
        s.id === editingSubjectId ? { ...subjectFormData, id: editingSubjectId } : s
      ));
      setEditingSubjectId(null);
    } else {
      setSubjects([...subjects, { ...subjectFormData, id: Date.now().toString() }]);
      setIsAddingSubject(false);
    }
    
    setSubjectFormData({
      name: '',
      code: '',
      heSoMon: 1,
      description: ''
    });
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectFormData(subject);
    setIsAddingSubject(true);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      setSubjects(subjects.filter(s => s.id !== id));
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
  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGradeId) {
      setGrades(grades.map(g => 
        g.id === editingGradeId ? { ...gradeFormData, id: editingGradeId } : g
      ));
      setEditingGradeId(null);
    } else {
      setGrades([...grades, { ...gradeFormData, id: Date.now().toString() }]);
      setIsAddingGrade(false);
    }
    
    setGradeFormData({
      name: '',
      classCount: 0,
    });
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGradeId(grade.id);
    setGradeFormData(grade);
    setIsAddingGrade(true);
  };

  const handleDeleteGrade = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khối lớp này?')) {
      setGrades(grades.filter(g => g.id !== id));
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
          onClick={() => setActiveTab('semesters')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'semesters'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Học kỳ
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'subjects'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Môn học
        </button>
        <button
          onClick={() => setActiveTab('grades')}
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
                      value={semesterFormData.name}
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
                      value={semesterFormData.year}
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
                      value={semesterFormData.startDate}
                      onChange={(e) => setSemesterFormData({ ...semesterFormData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      required
                      value={semesterFormData.endDate}
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
                {semesters.map((semester) => (
                  <tr key={semester.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{semester.name}</td>
                    <td className="px-6 py-4 text-gray-900">{semester.year}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(semester.startDate).toLocaleDateString('vi-VN')} - {new Date(semester.endDate).toLocaleDateString('vi-VN')}
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
                          onClick={() => handleDeleteSemester(semester.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Tab Content */}
      {activeTab === 'subjects' && (
        <div>
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
                      value={subjectFormData.name}
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
                      value={subjectFormData.code}
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
                      value={subjectFormData.heSoMon}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, heSoMon: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Mô tả</label>
                    <input
                      type="text"
                      value={subjectFormData.description}
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
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{subject.code}</td>
                    <td className="px-6 py-4 text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4 text-gray-900">{subject.heSoMon}</td>
                    <td className="px-6 py-4 text-gray-600">{subject.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Tab Content */}
      {activeTab === 'grades' && (
        <div>
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
                      value={gradeFormData.name}
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
                      value={gradeFormData.classCount}
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
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{grade.name}</td>
                    <td className="px-6 py-4 text-gray-900">{grade.classCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGrade(grade)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}