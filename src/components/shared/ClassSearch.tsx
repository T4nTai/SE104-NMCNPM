import { useState } from 'react';
import { Users, Search, Filter } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  gender: string;
  birthYear: number;
  address: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  students: Student[];
}

const MOCK_CLASSES: ClassInfo[] = [
  {
    id: '1',
    name: '10A1',
    grade: 'Khối 10',
    totalStudents: 42,
    students: [
      { id: '1', name: 'Nguyễn Văn An', gender: 'Nam', birthYear: 2008, address: '123 Đường ABC, Quận 1, TP.HCM' },
      { id: '2', name: 'Trần Thị Bình', gender: 'Nữ', birthYear: 2008, address: '456 Đường XYZ, Quận 2, TP.HCM' },
      { id: '3', name: 'Lê Văn Cường', gender: 'Nam', birthYear: 2008, address: '789 Đường DEF, Quận 3, TP.HCM' },
      { id: '4', name: 'Phạm Thị Dung', gender: 'Nữ', birthYear: 2008, address: '321 Đường GHI, Quận 4, TP.HCM' },
      { id: '5', name: 'Hoàng Văn Em', gender: 'Nam', birthYear: 2008, address: '654 Đường JKL, Quận 5, TP.HCM' },
    ]
  },
  {
    id: '2',
    name: '10A2',
    grade: 'Khối 10',
    totalStudents: 40,
    students: [
      { id: '6', name: 'Vũ Thị Phương', gender: 'Nữ', birthYear: 2008, address: '987 Đường MNO, Quận 6, TP.HCM' },
      { id: '7', name: 'Đỗ Văn Giang', gender: 'Nam', birthYear: 2008, address: '147 Đường PQR, Quận 7, TP.HCM' },
      { id: '8', name: 'Bùi Thị Hạnh', gender: 'Nữ', birthYear: 2008, address: '258 Đường STU, Quận 8, TP.HCM' },
      { id: '9', name: 'Đinh Văn Ích', gender: 'Nam', birthYear: 2008, address: '369 Đường VWX, Quận 9, TP.HCM' },
    ]
  },
  {
    id: '3',
    name: '11A1',
    grade: 'Khối 11',
    totalStudents: 38,
    students: [
      { id: '10', name: 'Trương Thị Kim', gender: 'Nữ', birthYear: 2007, address: '741 Đường YZ, Quận 10, TP.HCM' },
      { id: '11', name: 'Lý Văn Long', gender: 'Nam', birthYear: 2007, address: '852 Đường ABC, Quận 11, TP.HCM' },
      { id: '12', name: 'Mai Thị Nga', gender: 'Nữ', birthYear: 2007, address: '963 Đường DEF, Quận 12, TP.HCM' },
    ]
  },
  {
    id: '4',
    name: '12A1',
    grade: 'Khối 12',
    totalStudents: 35,
    students: [
      { id: '13', name: 'Ngô Văn Oanh', gender: 'Nam', birthYear: 2006, address: '159 Đường GHI, Bình Thạnh, TP.HCM' },
      { id: '14', name: 'Phan Thị Phương', gender: 'Nữ', birthYear: 2006, address: '753 Đường JKL, Phú Nhuận, TP.HCM' },
      { id: '15', name: 'Quách Văn Quyền', gender: 'Nam', birthYear: 2006, address: '951 Đường MNO, Tân Bình, TP.HCM' },
    ]
  },
];

interface ClassSearchProps {
  userRole: 'teacher' | 'student';
}

export function ClassSearch({ userRole }: ClassSearchProps) {
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(
    userRole === 'student' ? MOCK_CLASSES[0] : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('HK1');

  const filteredClasses = MOCK_CLASSES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGrade === 'all' || c.grade === selectedGrade)
  );

  return (
    <div>
      <h1 className={userRole === 'teacher' ? 'text-green-900 mb-6' : 'text-blue-900 mb-6'}>
        Tra cứu lớp học
      </h1>

      {userRole === 'teacher' && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === 'teacher' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-gray-900 mb-4">Danh sách lớp</h2>
            
            {/* Tìm kiếm và lọc */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm tên lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tất cả khối</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => setSelectedClass(classItem)}
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
                        <p className="text-gray-600">{classItem.grade} - {classItem.totalStudents} HS</p>
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
        )}

        <div className={userRole === 'student' ? 'md:col-span-3' : 'md:col-span-2'}>
          {selectedClass ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Lớp {selectedClass.name}</h2>
                  <p className="text-gray-600">{selectedClass.grade} - Sĩ số: {selectedClass.totalStudents} học sinh</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">STT</th>
                      <th className="px-4 py-3 text-left text-gray-700">Họ và tên</th>
                      <th className="px-4 py-3 text-left text-gray-700">Giới tính</th>
                      <th className="px-4 py-3 text-left text-gray-700">Năm sinh</th>
                      <th className="px-4 py-3 text-left text-gray-700">Địa chỉ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedClass.students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-gray-600">{student.gender}</td>
                        <td className="px-4 py-3 text-gray-600">{student.birthYear}</td>
                        <td className="px-4 py-3 text-gray-600">{student.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chọn một lớp để xem thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
