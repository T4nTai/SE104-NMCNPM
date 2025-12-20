import { useState, useEffect } from 'react';
import { Save, Settings, Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';

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
  MaNH: number;        // Primary key from backend
  Nam1: number;        // Start year
  Nam2: number;        // End year
  name: string;        // Display name: "Nam1-Nam2"
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
  minAge: 0,
  maxAge: 0,
  maxStudentsPerClass: 0,
  diemDatMon: 0,
  diemDatHocKy: 0,
  gradeWeight: {
    mieng15Phut: 0,
    mot1Tiet: 0,
    giuaKy: 0,
    cuoiKy: 0
  }
};

export function ParameterSettings() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [params, setParams] = useState<SystemParameters>(INITIAL_PARAMS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch academic years on mount
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Fetch parameters when year changes
  useEffect(() => {
    if (selectedYearId) {
      fetchParameters(selectedYearId);
    }
  }, [selectedYearId]);

  async function fetchAcademicYears() {
    try {
      setLoading(true);
      setError('');
      const semesters = await api.listSemesters();
      
      // Extract unique academic years from semesters
      const yearsMap = new Map<number, AcademicYear>();
      semesters.forEach((semester: any) => {
        const nh = semester.NamHoc || semester.namHoc;
        if (nh && nh.MaNH) {
          yearsMap.set(nh.MaNH, {
            MaNH: nh.MaNH,
            Nam1: nh.Nam1,
            Nam2: nh.Nam2,
            name: `${nh.Nam1}-${nh.Nam2}`
          });
        }
      });
      
      const years = Array.from(yearsMap.values()).sort((a, b) => b.Nam1 - a.Nam1);
      setAcademicYears(years);
      
      // Auto-select most recent year
      if (years.length > 0 && !selectedYearId) {
        setSelectedYearId(years[0].MaNH);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách năm học');
      console.error('Error fetching academic years:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchParameters(MaNH: number) {
    try {
      setLoading(true);
      setError('');
      const resp = await api.getParameters(String(MaNH));
      
      // Map backend response (PascalCase) to frontend state
      const toNum = (v: any) => (typeof v === 'number' && isFinite(v) ? v : undefined);
      const mapped: SystemParameters = {
        diemDatMon: toNum(resp?.DiemDatMon) ?? INITIAL_PARAMS.diemDatMon,
        diemDatHocKy: toNum(resp?.DiemDat) ?? INITIAL_PARAMS.diemDatHocKy,
        maxStudentsPerClass: toNum(resp?.SiSoToiDa) ?? INITIAL_PARAMS.maxStudentsPerClass,
        minAge: toNum(resp?.TuoiToiThieu) ?? INITIAL_PARAMS.minAge,
        maxAge: toNum(resp?.TuoiToiDa) ?? INITIAL_PARAMS.maxAge,
        gradeWeight: { ...params.gradeWeight },
      };
      setParams(mapped);
    } catch (err: any) {
      // If 404 or no data, just use defaults
      console.log('Using default parameters (none saved yet for this year)');
      setParams(INITIAL_PARAMS);
    } finally {
      setLoading(false);
    }
  }

  // Academic Year Management - removed, now using data from API
  // Class Management
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [classFormData, setClassFormData] = useState({
    name: '',
    gradeLevel: 10
  });

  // Subject Management
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: ''
  });

  const handleYearChange = (MaNH: number) => {
    setSelectedYearId(MaNH);
    // Parameters will be fetched by useEffect
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedYearId) {
      setError('Vui lòng chọn năm học');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Validate all values are numbers
      if (!Number.isFinite(params.minAge) || !Number.isFinite(params.maxAge) || 
          !Number.isFinite(params.maxStudentsPerClass) || 
          !Number.isFinite(params.diemDatMon) || !Number.isFinite(params.diemDatHocKy)) {
        setError('Vui lòng nhập tất cả các giá trị số');
        setLoading(false);
        return;
      }
      
      // Map frontend state to backend payload (exactly as backend expects)
      const payload = {
        tuoiToiThieu: Number(params.minAge),
        tuoiToiDa: Number(params.maxAge),
        soHocSinhToiDa1Lop: Number(params.maxStudentsPerClass),
        diemToiThieu: 0,  // Min score (default 0)
        diemToiDa: 10,    // Max score (default 10)
        diemDatToiThieu: Number(params.diemDatMon),      // Min passing grade per subject
        diemToiThieuHocKy: Number(params.diemDatHocKy),  // Min passing grade per semester
      };

      console.log('[ParameterSettings] MaNH:', selectedYearId);
      console.log('[ParameterSettings] Sending payload:', JSON.stringify(payload, null, 2));
      
      await api.upsertParameters(selectedYearId.toString(), payload);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể lưu tham số');
      console.error('Error saving parameters:', err);
    } finally {
      setLoading(false);
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

      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Đã lưu thay đổi thành công!
        </div>
      )}

      {/* Select Academic Year for Parameters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-gray-900 mb-4">Chọn năm học để thiết lập tham số</h2>
        <select
          value={selectedYearId || ''}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading || academicYears.length === 0}
        >
          <option value="">-- Chọn năm học --</option>
          {academicYears.map((year) => (
            <option key={year.MaNH} value={year.MaNH}>
              {year.name}
            </option>
          ))}
        </select>
        <p className="text-gray-600 mt-2">
          Lưu ý: Năm học được tạo tự động từ học kỳ. Mỗi năm học có thể có tham số riêng biệt.
        </p>
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
          disabled={loading || !selectedYearId}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          Lưu tham số {selectedYearId ? `cho năm học ${academicYears.find(y => y.MaNH === selectedYearId)?.name}` : ''}
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