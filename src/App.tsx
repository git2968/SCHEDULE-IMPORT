import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AppCenter from './pages/AppCenter';
import ScheduleApp from './pages/ScheduleApp';
import CourseManagePage from './pages/CourseManagePage';
import ScheduleListPage from './pages/ScheduleListPage';
import IconShowcase from './pages/IconShowcase';

/**
 * 首次访问重定向组件
 * 智能引导用户到合适的页面
 */
const FirstVisitRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 只在根路径进行重定向
    if (location.pathname === '/') {
      // 延迟一下，确保Context已经初始化
      const timer = setTimeout(() => {
        // 首次访问进入课表应用
        navigate('/apps/schedule', { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  return null;
};

function App() {
  return (
    <>
      <FirstVisitRedirect />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 应用中心 */}
          <Route path="app-center" element={
            <ProtectedRoute>
              <AppCenter />
            </ProtectedRoute>
          } />
          
          {/* 课程表应用 */}
          <Route path="apps/schedule" element={
            <ProtectedRoute>
              <ScheduleApp />
            </ProtectedRoute>
          } />
          
          {/* 课程管理 */}
          <Route path="apps/schedule/courses" element={
            <ProtectedRoute>
              <CourseManagePage />
            </ProtectedRoute>
          } />
          
          {/* 课表列表 */}
          <Route path="apps/schedule/list" element={
            <ProtectedRoute>
              <ScheduleListPage />
            </ProtectedRoute>
          } />
          
          {/* 认证页面 */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* 开发工具 */}
          <Route path="icons" element={<IconShowcase />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App; 