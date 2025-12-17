import { useState } from 'react';
import { Save, Settings, Plus, Edit2, Trash2, X } from 'lucide-react';

interface SystemParameters {
  minAge: number;
  maxAge: number;
  maxStudentsPerClass: number;
  diemDatMon: number;
  diemDatHocKy: number;
  gradeWeight: {
    mieng15Phut: number;
    mot1Tiet: number;
    giuaKy: number;
    cuoiKy: number;
  };
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  parameters: SystemParameters;
}

interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: number;
}

interface SchoolSubject {
  id: string;
  name: string;
  code: string;
}

const INITIAL_PARAMS: SystemParameters = {
  minAge: 15,
  maxAge: 20,
  maxStudentsPerClass: 40,
  diemDatMon: 5.0,
  diemDatHocKy: 5.0,
  gradeWeight: {
    mieng15Phut: 1,
    mot1Tiet: 2,
    giuaKy: 3,
    cuoiKy: 3
  }
};

const MOCK_YEARS: AcademicYear[] = [
  {
    id: '1',
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-08-31',
    status: 'active',
    parameters: INITIAL_PARAMS
  },
  {
    id: '2',
    name: '2023-2024',
    startDate: '2023-09-01',
    endDate: '2024-08-31',
    status: 'inactive',
    parameters: INITIAL_PARAMS
  }
];

const MOCK_CLASSES: SchoolClass[] = [
  { id: '1', name: '10A1', gradeLevel: 10 },
  { id: '2', name: '10A2', gradeLevel: 10 },
  { id: '3', name: '10A3', gradeLevel: 10 },
  { id: '4', name: '10A4', gradeLevel: 10 },
  { id: '5', name: '11A1', gradeLevel: 11 },
  { id: '6', name: '11A2', gradeLevel: 11 },
  { id: '7', name: '11A3', gradeLevel: 11 },
  { id: '8', name: '12A1', gradeLevel: 12 },
  { id: '9', name: '12A2', gradeLevel: 12 },
];

const MOCK_SUBJECTS: SchoolSubject[] = [
  { id: '1', name: 'Toán', code: 'TOAN' },
  { id: '2', name: 'Văn', code: 'VAN' },
  { id: '3', name: 'Lý', code: 'LY' },
  { id: '4', name: 'Hóa', code: 'HOA' },
  { id: '5', name: 'Sinh', code: 'SINH' },
  { id: '6', name: 'Sử', code: 'SU' },
  { id: '7', name: 'Địa', code: 'DIA' },
  { id: '8', name: 'Đạo Đức', code: 'DD' },
  { id: '9', name: 'Thể Dục', code: 'TD' },
];

export function ParameterSettings() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(MOCK_YEARS);
  const [selectedYearId, setSelectedYearId] = useState<string>(MOCK_YEARS[0].id);
  const [params, setParams] = useState<SystemParameters>(MOCK_YEARS[0].parameters);
  const [saved, setSaved] = useState(false);

  // Academic Year Management
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [yearFormData, setYearFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'inactive' as 'active' | 'inactive'
  });

  // Class Management
  const [classes, setClasses] = useState<SchoolClass[]>(MOCK_CLASSES);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [classFormData, setClassFormData] = useState({
    name: '',
    gradeLevel: 10
  });

  // Subject Management
  const [subjects, setSubjects] = useState<SchoolSubject[]>(MOCK_SUBJECTS);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: ''
  });

  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId);
    const year = academicYears.find(y => y.id === yearId);
    if (year) {
      setParams(year.parameters);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update parameters for selected year
    setAcademicYears(academicYears.map(year =>
      year.id === selectedYearId ? { ...year, parameters: params } : year
    ));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Academic Year handlers
  const handleSubmitYear = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingYearId) {
      setAcademicYears(academicYears.map(y =>
        y.id === editingYearId ? { ...y, ...yearFormData } : y
      ));
      setEditingYearId(null);
    } else {
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        ...yearFormData,
        parameters: INITIAL_PARAMS
      };
      setAcademicYears([...academicYears, newYear]);
      setIsAddingYear(false);
    }
    
    setYearFormData({
      name: '',
      startDate: '',
      endDate: '',
      status: 'inactive'
    });
  };

  const handleDeleteYear = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa năm học này?')) {
      setAcademicYears(academicYears.filter(y => y.id !== id));
      if (selectedYearId === id && academicYears.length > 0) {
        const newSelectedYear = academicYears.find(y => y.id !== id);
        if (newSelectedYear) {
          setSelectedYearId(newSelectedYear.id);
          setParams(newSelectedYear.parameters);
        }
      }
    }
  };

  // Class handlers
  const handleSubmitClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      ...classFormData
    };
    setClasses([...classes, newClass]);
    setIsAddingClass(false);
    setClassFormData({
      name: '',
      gradeLevel: 10
    });
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp này?')) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  // Subject handlers
  const handleSubmitSubject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSubject: SchoolSubject = {
      id: Date.now().toString(),
      ...subjectFormData
    };
    setSubjects([...subjects, newSubject]);
    setIsAddingSubject(false);
    setSubjectFormData({
      name: '',
      code: ''
    });
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-indigo-600" />
        <h1 className="text-indigo-900">Thay đổi tham số hệ thống</h1>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Đã lưu thay đổi thành công!
        </div>
      )}

      {/* Academic Year Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900">Quản lý năm học</h2>
          {!isAddingYear && (
            <button
              onClick={() => setIsAddingYear(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Thêm năm học
            </button>
          )}
        </div>

        {isAddingYear && (
          <form onSubmit={handleSubmitYear} className="mb-4 p-4 bg-indigo-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Năm học</label>
                <input
                  type="text"
                  required
                  value={yearFormData.name}
                  onChange={(e) => setYearFormData({ ...yearFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="2024-2025"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={yearFormData.status}
                  onChange={(e) => setYearFormData({ ...yearFormData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="inactive">Chưa kích hoạt</option>
                  <option value="active">Đang hoạt động</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  required
                  value={yearFormData.startDate}
                  onChange={(e) => setYearFormData({ ...yearFormData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Ngày kết thúc</label>
                <input
                  type="date"
                  required
                  value={yearFormData.endDate}
                  onChange={(e) => setYearFormData({ ...yearFormData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4" />
                Lưu
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingYear(false);
                  setYearFormData({ name: '', startDate: '', endDate: '', status: 'inactive' });
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                <X className="w-4 h-4" />
                Hủy
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">Năm học</th>
                <th className="px-4 py-2 text-left text-gray-700">Thời gian</th>
                <th className="px-4 py-2 text-left text-gray-700">Trạng thái</th>
                <th className="px-4 py-2 text-left text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {academicYears.map((year) => (
                <tr key={year.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{year.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(year.startDate).toLocaleDateString('vi-VN')} - {new Date(year.endDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      year.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {year.status === 'active' ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteYear(year.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Select Academic Year for Parameters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-gray-900 mb-4">Chọn năm học để thiết lập tham số</h2>
        <select
          value={selectedYearId}
          onChange={(e) => handleYearChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name} {year.status === 'active' ? '(Đang hoạt động)' : ''}
            </option>
          ))}
        </select>
        <p className="text-gray-600 mt-2">Lưu ý: Mỗi năm học có thể có tham số riêng biệt</p>
      </div>

      {/* Parameter Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-gray-900 mb-4">Tham số điểm số</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Điểm đạt tối thiểu</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={params.diemDatMon}
                onChange={(e) => setParams({ ...params, diemDatMon: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-gray-600 mt-1">Điểm tối thiểu để đạt môn học</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Điểm đạt tối thiểu học kỳ</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={params.diemDatHocKy}
                onChange={(e) => setParams({ ...params, diemDatHocKy: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-gray-600 mt-1">Điểm tối thiểu để đạt học kỳ</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-gray-900 mb-4">Tham số lớp học</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Số học sinh tối đa/lớp</label>
              <input
                type="number"
                min="1"
                value={params.maxStudentsPerClass}
                onChange={(e) => setParams({ ...params, maxStudentsPerClass: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Tuổi học sinh tối thiểu</label>
              <input
                type="number"
                min="1"
                value={params.minAge}
                onChange={(e) => setParams({ ...params, minAge: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Tuổi học sinh tối đa</label>
              <input
                type="number"
                min="1"
                value={params.maxAge}
                onChange={(e) => setParams({ ...params, maxAge: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-gray-900 mb-4">Trọng số điểm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Điểm miệng 15 phút (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={params.gradeWeight.mieng15Phut}
                onChange={(e) => setParams({ 
                  ...params, 
                  gradeWeight: { ...params.gradeWeight, mieng15Phut: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Điểm một tiết (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={params.gradeWeight.mot1Tiet}
                onChange={(e) => setParams({ 
                  ...params, 
                  gradeWeight: { ...params.gradeWeight, mot1Tiet: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Điểm giữa kỳ (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={params.gradeWeight.giuaKy}
                onChange={(e) => setParams({ 
                  ...params, 
                  gradeWeight: { ...params.gradeWeight, giuaKy: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Điểm cuối kỳ (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={params.gradeWeight.cuoiKy}
                onChange={(e) => setParams({ 
                  ...params, 
                  gradeWeight: { ...params.gradeWeight, cuoiKy: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <p className="text-gray-700">
              Tổng trọng số: {params.gradeWeight.mieng15Phut + params.gradeWeight.mot1Tiet + params.gradeWeight.giuaKy + params.gradeWeight.cuoiKy}%
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          <Save className="w-5 h-5" />
          Lưu tham số cho năm học {academicYears.find(y => y.id === selectedYearId)?.name}
        </button>
      </form>

      {/* Class Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900">Danh sách lớp trong trường</h2>
          {!isAddingClass && (
            <button
              onClick={() => setIsAddingClass(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Thêm lớp
            </button>
          )}
        </div>

        {isAddingClass && (
          <form onSubmit={handleSubmitClass} className="mb-4 p-4 bg-indigo-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên lớp</label>
                <input
                  type="text"
                  required
                  value={classFormData.name}
                  onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="10A1"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Khối lớp</label>
                <select
                  value={classFormData.gradeLevel}
                  onChange={(e) => setClassFormData({ ...classFormData, gradeLevel: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4" />
                Lưu
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingClass(false);
                  setClassFormData({ name: '', gradeLevel: 10 });
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                <X className="w-4 h-4" />
                Hủy
              </button>
            </div>
          </form>
        )}

        <p className="text-gray-600 mb-3">Tổng số lớp: {classes.length}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-900">{cls.name}</span>
              <button
                onClick={() => handleDeleteClass(cls.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900">Danh sách môn học</h2>
          {!isAddingSubject && (
            <button
              onClick={() => setIsAddingSubject(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Thêm môn học
            </button>
          )}
        </div>

        {isAddingSubject && (
          <form onSubmit={handleSubmitSubject} className="mb-4 p-4 bg-indigo-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên môn học</label>
                <input
                  type="text"
                  required
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="TOAN"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4" />
                Lưu
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubject(false);
                  setSubjectFormData({ name: '', code: '' });
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                <X className="w-4 h-4" />
                Hủy
              </button>
            </div>
          </form>
        )}

        <p className="text-gray-600 mb-3">Tổng số môn học: {subjects.length}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-gray-900">{subject.name}</p>
                <p className="text-gray-600">{subject.code}</p>
              </div>
              <button
                onClick={() => handleDeleteSubject(subject.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}