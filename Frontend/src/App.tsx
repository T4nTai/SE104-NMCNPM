import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { logout } from './services/api';

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

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentScreen('dashboard');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('currentUser');
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