import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';

export type UserRole = 'admin' | 'student' | 'teacher' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const handleRegister = () => {
    setCurrentScreen('login');
  };

  if (currentScreen === 'login') {
    return (
      <LoginScreen 
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen 
        onRegister={handleRegister}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'dashboard' && currentUser) {
    if (currentUser.role === 'admin') {
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    } else if (currentUser.role === 'student') {
      return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
    } else if (currentUser.role === 'teacher') {
      return <TeacherDashboard user={currentUser} onLogout={handleLogout} />;
    }
  }

  return null;
}
