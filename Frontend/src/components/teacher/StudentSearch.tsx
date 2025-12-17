import { useState } from 'react';
import { Search, User } from 'lucide-react';

interface Student {
  id: string;
  studentCode: string;
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  phone: string;
  className: string;
  grade: string;
  address: string;
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    studentCode: 'HS001',
    name: 'Nguyễn Văn An',
    gender: 'Nam',
    birthDate: '2008-05-15',
    email: 'an@student.com',
    phone: '0123456789',
    className: '10A1',
    grade: 'Khối 10',
    address: '123 Đường ABC, Quận 1, TP.HCM'
  },
  {
    id: '2',
    studentCode: 'HS002',
    name: 'Trần Thị Bình',
    gender: 'Nữ',
    birthDate: '2008-03-20',
    email: 'binh@student.com',
    phone: '0123456790',
    className: '10A1',
    grade: 'Khối 10',
    address: '456 Đường XYZ, Quận 2, TP.HCM'
  },
  {
    id: '3',
    studentCode: 'HS003',
    name: 'Lê Văn Cường',
    gender: 'Nam',
    birthDate: '2008-07-10',
    email: 'cuong@student.com',
    phone: '0123456791',
    className: '10A2',
    grade: 'Khối 10',
    address: '789 Đường DEF, Quận 3, TP.HCM'
  },
];

export function StudentSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = MOCK_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-green-900 mb-6">Tra cứu học sinh</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã học sinh hoặc lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-gray-900">Kết quả tìm kiếm ({filteredStudents.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedStudent?.id === student.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">{student.name}</p>
                    <p className="text-gray-600">{student.studentCode} - {student.className}</p>
                  </div>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && searchTerm && (
              <div className="p-8 text-center text-gray-500">
                Không tìm thấy học sinh nào
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          {selectedStudent ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-gray-900">Thông tin chi tiết</h2>
                  <p className="text-gray-600">Mã: {selectedStudent.studentCode}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Họ và tên</p>
                  <p className="text-gray-900">{selectedStudent.name}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Giới tính</p>
                  <p className="text-gray-900">{selectedStudent.gender}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Ngày sinh</p>
                  <p className="text-gray-900">
                    {new Date(selectedStudent.birthDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Lớp</p>
                  <p className="text-gray-900">{selectedStudent.className} - {selectedStudent.grade}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{selectedStudent.email}</p>
                </div>

                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-600 mb-1">Số điện thoại</p>
                  <p className="text-gray-900">{selectedStudent.phone}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Địa chỉ</p>
                  <p className="text-gray-900">{selectedStudent.address}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chọn một học sinh để xem thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
