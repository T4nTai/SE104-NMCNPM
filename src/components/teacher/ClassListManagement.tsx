import { useState } from 'react';
import { Plus, Edit, Trash2, Users, Search, Filter } from 'lucide-react';

interface Student {
  id: string;
  studentCode: string;
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  students: Student[];
}

const MOCK_CLASSES: Class[] = [
  {
    id: '1',
    name: '10A1',
    grade: 'Khối 10',
    students: [
      { id: '1', studentCode: 'HS001', name: 'Nguyễn Văn An', gender: 'Nam', birthDate: '2008-05-15', email: 'an@student.com', phone: '0123456789', address: '123 Đường ABC, Quận 1, TP.HCM' },
      { id: '2', studentCode: 'HS002', name: 'Trần Thị Bình', gender: 'Nữ', birthDate: '2008-03-20', email: 'binh@student.com', phone: '0123456790', address: '456 Đường XYZ, Quận 2, TP.HCM' },
      { id: '3', studentCode: 'HS003', name: 'Lê Văn Cường', gender: 'Nam', birthDate: '2008-07-10', email: 'cuong@student.com', phone: '0123456791', address: '789 Đường DEF, Quận 3, TP.HCM' },
    ]
  },
  {
    id: '2',
    name: '10A2',
    grade: 'Khối 10',
    students: [
      { id: '4', studentCode: 'HS004', name: 'Phạm Thị Dung', gender: 'Nữ', birthDate: '2008-06-25', email: 'dung@student.com', phone: '0123456792', address: '321 Đường GHI, Quận 4, TP.HCM' },
    ]
  },
  {
    id: '3',
    name: '11A1',
    grade: 'Khối 11',
    students: [
      { id: '5', studentCode: 'HS005', name: 'Hoàng Văn Em', gender: 'Nam', birthDate: '2007-08-12', email: 'em@student.com', phone: '0123456793', address: '654 Đường JKL, Quận 5, TP.HCM' },
      { id: '6', studentCode: 'HS006', name: 'Vũ Thị Phương', gender: 'Nữ', birthDate: '2007-09-22', email: 'phuong@student.com', phone: '0123456794', address: '987 Đường MNO, Quận 6, TP.HCM' },
    ]
  },
  {
    id: '4',
    name: '12A1',
    grade: 'Khối 12',
    students: [
      { id: '7', studentCode: 'HS007', name: 'Đỗ Văn Giang', gender: 'Nam', birthDate: '2006-11-05', email: 'giang@student.com', phone: '0123456795', address: '147 Đường PQR, Quận 7, TP.HCM' },
    ]
  }
];

export function ClassListManagement() {
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('HK1');
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    studentCode: '',
    name: '',
    gender: 'Nam',
    birthDate: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsAddingStudent(false);
    setEditingStudentId(null);
  };

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    // Kiểm tra tuổi học sinh (15-20)
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 15 || age > 20) {
      alert('Tuổi học sinh phải từ 15 đến 20');
      return;
    }

    // Kiểm tra sĩ số lớp không quá 40
    if (!editingStudentId && selectedClass.students.length >= 40) {
      alert('Lớp đã đủ sĩ số (tối đa 40 học sinh)');
      return;
    }

    const updatedClasses = classes.map(c => {
      if (c.id === selectedClass.id) {
        if (editingStudentId) {
          return {
            ...c,
            students: c.students.map(s =>
              s.id === editingStudentId ? { ...formData, id: editingStudentId } : s
            )
          };
        } else {
          return {
            ...c,
            students: [...c.students, { ...formData, id: Date.now().toString() }]
          };
        }
      }
      return c;
    });

    setClasses(updatedClasses);
    const updated = updatedClasses.find(c => c.id === selectedClass.id);
    if (updated) setSelectedClass(updated);
    
    setIsAddingStudent(false);
    setEditingStudentId(null);
    setFormData({
      studentCode: '',
      name: '',
      gender: 'Nam',
      birthDate: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({
      studentCode: student.studentCode,
      name: student.name,
      gender: student.gender,
      birthDate: student.birthDate,
      email: student.email,
      phone: student.phone,
      address: student.address
    });
    setIsAddingStudent(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!selectedClass) return;
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;

    const updatedClasses = classes.map(c => {
      if (c.id === selectedClass.id) {
        return {
          ...c,
          students: c.students.filter(s => s.id !== studentId)
        };
      }
      return c;
    });

    setClasses(updatedClasses);
    const updated = updatedClasses.find(c => c.id === selectedClass.id);
    if (updated) setSelectedClass(updated);
  };

  const filteredStudents = selectedClass?.students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(classSearchTerm.toLowerCase()) &&
    (selectedGrade === 'all' || c.grade === selectedGrade)
  );

  return (
    <div>
      <h1 className="text-green-900 mb-6">Quản lý danh sách lớp</h1>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-green-600" />
          Tra cứu danh sách lớp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Năm học</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
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
          <div>
            <label className="block text-gray-700 mb-2">Tìm kiếm theo tên lớp</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nhập tên lớp (VD: 10A1)..."
                value={classSearchTerm}
                onChange={(e) => setClassSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Lọc theo khối</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tất cả khối</option>
                <option value="Khối 10">Khối 10</option>
                <option value="Khối 11">Khối 11</option>
                <option value="Khối 12">Khối 12</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>Tổng số lớp: <strong className="text-gray-900">{filteredClasses.length}</strong></span>
          <span>Tổng số học sinh: <strong className="text-gray-900">{filteredClasses.reduce((sum, c) => sum + c.students.length, 0)}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-gray-900 mb-4">Danh sách lớp</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredClasses.length > 0 ? (
              filteredClasses.map(classItem => (
                <button
                  key={classItem.id}
                  onClick={() => handleSelectClass(classItem)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedClass?.id === classItem.id
                      ? 'bg-green-100 border-2 border-green-600'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-gray-900">{classItem.name}</p>
                      <p className="text-gray-600">{classItem.grade} - {classItem.students.length} học sinh</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Không tìm thấy lớp nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedClass ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900">Lớp {selectedClass.name}</h2>
                {!isAddingStudent && (
                  <button
                    onClick={() => setIsAddingStudent(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm học sinh
                  </button>
                )}
              </div>

              {isAddingStudent && (
                <form onSubmit={handleSubmitStudent} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-gray-900 mb-3">
                    {editingStudentId ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Mã học sinh"
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 col-span-2"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      {editingStudentId ? 'Cập nhật' : 'Thêm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingStudent(false);
                        setEditingStudentId(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">Mã HS</th>
                      <th className="px-4 py-3 text-left text-gray-700">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-gray-700">Giới tính</th>
                      <th className="px-4 py-3 text-left text-gray-700">Ngày sinh</th>
                      <th className="px-4 py-3 text-left text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{student.studentCode}</td>
                        <td className="px-4 py-3 text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-gray-600">{student.gender}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(student.birthDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chọn một lớp để xem danh sách học sinh</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}