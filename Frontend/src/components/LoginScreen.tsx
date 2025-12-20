import { useState } from 'react';
import { User } from '../App';
import { LogIn } from 'lucide-react';
import { api, setAuthToken } from '../api/client';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

const defaultUsers: Record<
  string,
  { password: string; role: 'admin' | 'student' | 'teacher'; name: string; email: string }
> = {
  admin: {
    password: '123',
    role: 'admin',
    name: 'Quản trị viên',
    email: 'admin@example.com',
  },
  student: {
    password: '123',
    role: 'student',
    name: 'Học sinh',
    email: 'student@example.com',
  },
  teacher: {
    password: '123',
    role: 'teacher',
    name: 'Giáo viên',
    email: 'teacher@example.com',
  },
};

export function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();

    // ==== 1) Check 3 tài khoản mặc định trước ====
    const defaultUser = defaultUsers[trimmedUsername];

    if (defaultUser && password === defaultUser.password) {
      const user: User = {
        id: trimmedUsername,
        name: defaultUser.name,
        email: defaultUser.email,
        role: defaultUser.role,
      };

      // Token giả cho tài khoản mặc định
      setAuthToken(`local-${defaultUser.role}-token`);
      onLogin(user);
      setLoading(false);
      return; // Không gọi API nữa
    }

    // ==== 2) Nếu không phải default account -> gọi API như cũ ====
    try {
      // Call API login with username and password
      const response = await api.login(username, password);

      // Set the authentication token
      setAuthToken(response.token);

      // Extract user info from response
      const userInfo = response.user || {};

      // Map API response to User type expected by App
      const user: User = {
        id: userInfo.MaNguoiDung || userInfo.id || username,
        name:
          userInfo.TenNguoiDung ||
          userInfo.HoVaTen ||
          userInfo.TenDangNhap ||
          username,
        email: userInfo.Email || username,
        role: (userInfo.VaiTro || userInfo.role || 'student') as
          | 'admin'
          | 'student'
          | 'teacher',
      };

      // Call the onLogin callback
      onLogin(user);
    } catch (err: any) {
      setError(
        err.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.',
      );
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-4 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-center text-indigo-900 mb-2">Hệ thống Quản lý Học sinh</h1>
        <p className="text-center text-gray-600 mb-8">Đăng nhập để tiếp tục</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
