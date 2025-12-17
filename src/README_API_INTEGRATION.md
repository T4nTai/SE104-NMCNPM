# Hướng dẫn Tích hợp API - Hệ thống Quản lý Học sinh

## 📋 Tổng quan

Hệ thống đã được chuẩn bị sẵn để tích hợp với Backend API. Tất cả các component đã được cập nhật để sử dụng API service thay vì mock data.

## 🚀 Bắt đầu nhanh

### 1. Cấu hình môi trường

Tạo file `.env` trong thư mục root:

```bash
cp .env.example .env
```

Cập nhật URL API trong file `.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy ứng dụng

```bash
npm start
```

## 📁 Cấu trúc Files

### Core Files

- `/services/api.ts` - API service layer với tất cả các functions để gọi backend
- `/App.tsx` - Đã tích hợp authentication với localStorage
- `/components/LoginScreen.tsx` - Đã tích hợp login API

### Admin Components (Đã tích hợp API)

✅ `/components/admin/UserManagement.tsx` - Quản lý người dùng
✅ `/components/admin/UserGroupManagement.tsx` - Quản lý nhóm người dùng  
✅ `/components/admin/PermissionManagement.tsx` - Quản lý quyền
⏳ `/components/admin/RegulationManagement.tsx` - Cần tích hợp API
⏳ `/components/admin/ParameterSettings.tsx` - Cần tích hợp API
⏳ `/components/admin/SemesterReport.tsx` - Cần tích hợp API
⏳ `/components/admin/SubjectReport.tsx` - Cần tích hợp API

### Teacher & Student Components

⏳ Tất cả các components trong `/components/teacher/` và `/components/student/` - Cần tích hợp API

## 🔧 API Service Layer

File `/services/api.ts` cung cấp:

### Authentication
```typescript
import { login, logout } from './services/api';

// Login
const response = await login(username, password);
// Token tự động được lưu vào localStorage

// Logout
logout();
// Token tự động bị xóa khỏi localStorage
```

### User Management
```typescript
import { userApi } from './services/api';

await userApi.getAll();
await userApi.getById(id);
await userApi.create(data);
await userApi.update(id, data);
await userApi.delete(id);
```

### User Groups
```typescript
import { userGroupApi } from './services/api';

await userGroupApi.getAll();
await userGroupApi.create(data);
await userGroupApi.update(id, data);
await userGroupApi.delete(id);
```

### Permissions
```typescript
import { permissionApi } from './services/api';

await permissionApi.getAll();
await permissionApi.create(data);
await permissionApi.update(id, data);
await permissionApi.delete(id);
```

### Semesters, Subjects, Grades
```typescript
import { semesterApi, subjectApi, gradeApi } from './services/api';

// Tương tự pattern cho các APIs khác
await semesterApi.getAll();
await subjectApi.create(data);
await gradeApi.update(id, data);
```

### Classes & Students
```typescript
import { classApi, studentApi } from './services/api';

await classApi.getAll();
await classApi.getByGrade(grade);
await studentApi.getByClass(classId);
await studentApi.search(keyword);
```

### Scores & Reports
```typescript
import { scoreApi, reportApi } from './services/api';

await scoreApi.getByStudent(studentId);
await scoreApi.getByClass(classId, subjectId, semesterId);
await scoreApi.createBulk(data);

await reportApi.getSemesterReport(semesterId);
await reportApi.getSubjectReport(subjectId, semesterId);
```

## 🔐 Authentication Flow

### 1. Login Process

```typescript
// LoginScreen.tsx đã implement
const response = await login(username, password);
// Response: { token: string, user: {...} }

// Token tự động lưu vào localStorage với key 'authToken'
// User info lưu vào localStorage với key 'currentUser'
```

### 2. Auto-login on Refresh

```typescript
// App.tsx đã implement
useEffect(() => {
  const token = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('currentUser');
  
  if (token && savedUser) {
    // Tự động login user
  }
}, []);
```

### 3. API Calls với Token

Tất cả API calls tự động thêm token vào header:

```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}
```

## ⚠️ Error Handling

Tất cả API calls đã có error handling:

```typescript
try {
  setLoading(true);
  setError(null);
  const data = await userApi.getAll();
  setUsers(data);
} catch (err: any) {
  setError(err.message || 'Không thể tải dữ liệu');
  console.error('Error:', err);
} finally {
  setLoading(false);
}
```

## 📊 Loading States

Mọi component đã có loading state:

```typescript
const [loading, setLoading] = useState(false);

{loading && (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
)}
```

## 🎯 Các bước tiếp theo để hoàn thành tích hợp

### Bước 1: Xây dựng Backend API

Tham khảo file `/BACKEND_API_SPEC.md` để xây dựng các endpoints cần thiết.

### Bước 2: Cập nhật các components còn lại

Các components sau cần được cập nhật để sử dụng API (pattern tương tự UserManagement.tsx):

**Admin Components:**
- RegulationManagement.tsx
- ParameterSettings.tsx
- SemesterReport.tsx
- SubjectReport.tsx

**Teacher Components:**
- StudentManagement.tsx
- ScoreEntry.tsx
- ClassList.tsx
- StudentLookup.tsx

**Student Components:**
- StudentInfo.tsx
- ScoreLookup.tsx

### Bước 3: Test API Integration

1. Chạy backend server
2. Chạy frontend app
3. Test từng chức năng:
   - ✅ Login/Logout
   - ✅ User Management
   - ✅ User Group Management
   - ✅ Permission Management
   - ⏳ Regulation Management
   - ⏳ Parameter Settings
   - ⏳ Student Management
   - ⏳ Score Entry
   - ⏳ Reports

## 🔄 Pattern để tích hợp API vào components còn lại

### Template cơ bản:

```typescript
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { yourApi } from '../../services/api';

export function YourComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await yourApi.getAll();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await yourApi.create(formData);
      await fetchData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      await yourApi.update(id, formData);
      await fetchData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await yourApi.delete(id);
      await fetchData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!loading && (
        // Your component content
      )}
    </div>
  );
}
```

## 📚 Tài liệu bổ sung

- `/BACKEND_API_SPEC.md` - Specification chi tiết của tất cả API endpoints
- `/API_INTEGRATION_GUIDE.md` - Hướng dẫn ban đầu về API integration
- `/services/api.ts` - Source code của API service layer

## 💡 Tips

1. **Token hết hạn**: Backend nên trả về status 401, frontend sẽ redirect về login
2. **Network errors**: Đã được handle bởi try-catch trong mọi API call
3. **Loading states**: Luôn hiển thị spinner khi đang gọi API
4. **Error messages**: Hiển thị thông báo lỗi thân thiện cho người dùng
5. **Data refresh**: Sau khi create/update/delete, luôn gọi lại fetchData() để cập nhật UI

## ✅ Checklist hoàn thành

### Frontend
- [x] Tạo API service layer
- [x] Tích hợp authentication
- [x] Cập nhật UserManagement component
- [x] Cập nhật UserGroupManagement component
- [x] Cập nhật PermissionManagement component
- [x] Cập nhật LoginScreen
- [x] Thêm error handling
- [x] Thêm loading states
- [ ] Cập nhật RegulationManagement
- [ ] Cập nhật ParameterSettings
- [ ] Cập nhật SemesterReport
- [ ] Cập nhật SubjectReport
- [ ] Cập nhật Teacher components
- [ ] Cập nhật Student components

### Backend
- [ ] Implement authentication endpoints
- [ ] Implement user management endpoints
- [ ] Implement user group endpoints
- [ ] Implement permission endpoints
- [ ] Implement semester/subject/grade endpoints
- [ ] Implement class/student endpoints
- [ ] Implement score endpoints
- [ ] Implement report endpoints
- [ ] Add validation
- [ ] Add error handling
- [ ] Setup CORS
- [ ] Deploy to production

## 🆘 Support

Nếu gặp vấn đề khi tích hợp API:

1. Kiểm tra console browser để xem error message
2. Kiểm tra Network tab để xem request/response
3. Verify rằng backend đang chạy và CORS đã được cấu hình
4. Kiểm tra token có được lưu trong localStorage không
5. Verify API endpoint URL trong file .env

---

**Lưu ý**: Website hiện đã sẵn sàng để tích hợp API. Các components chính (UserManagement, UserGroupManagement, PermissionManagement) đã được cập nhật hoàn chỉnh và có thể dùng làm reference để cập nhật các components còn lại.
