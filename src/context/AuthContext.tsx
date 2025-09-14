import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthContextType } from '../types';

// 创建认证上下文
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从本地存储加载用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // 登录功能
  const login = async (email: string, password: string) => {
    try {
      // 在实际应用中，这里应该调用API进行身份验证
      // 这里我们模拟登录过程
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      );
      
      if (!user) {
        throw new Error('用户名或密码错误');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // 注册功能
  const register = async (email: string, password: string, displayName: string) => {
    try {
      // 在实际应用中，这里应该调用API进行用户注册
      // 这里我们模拟注册过程
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 检查邮箱是否已被注册
      if (users.some((user: User) => user.email === email)) {
        throw new Error('该邮箱已被注册');
      }
      
      // 创建新用户
      const newUser = {
        id: uuidv4(),
        email,
        password,
        displayName
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // 自动登录
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // 登出功能
  const logout = async (onBeforeLogout?: () => Promise<void>) => {
    try {
      // 如果提供了登出前回调，先执行回调（例如过渡动画）
      if (onBeforeLogout) {
        await onBeforeLogout();
      }
      
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      
      // 简单刷新页面以切换到默认背景
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 