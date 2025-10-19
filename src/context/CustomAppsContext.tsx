/**
 * 自定义应用管理 Context
 * 支持用户添加、编辑、删除自定义应用
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { App } from '../types/apps';

interface CustomApp extends Omit<App, 'category' | 'subcategory'> {
  categoryId: string;
  subcategoryId: string;
  iconType: 'lineicon' | 'upload'; // 图标类型：Lineicons 或 上传的图片
  iconUrl?: string; // 如果是上传的图片，保存URL
  isExternal: boolean; // 是否是外部链接
}

interface CustomAppsContextType {
  customApps: CustomApp[];
  addCustomApp: (app: CustomApp) => void;
  updateCustomApp: (id: string, app: Partial<CustomApp>) => void;
  deleteCustomApp: (id: string) => void;
  getCustomAppsByCategory: (categoryId: string, subcategoryId: string) => CustomApp[];
}

const CustomAppsContext = createContext<CustomAppsContextType | undefined>(undefined);

const STORAGE_KEY = 'custom_apps';

export const CustomAppsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customApps, setCustomApps] = useState<CustomApp[]>([]);

  // 从 localStorage 加载自定义应用
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomApps(parsed);
      }
    } catch (error) {
      console.error('加载自定义应用失败', error);
    }
  }, []);

  // 保存到 localStorage
  const saveToStorage = (apps: CustomApp[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } catch (error) {
      console.error('保存自定义应用失败', error);
    }
  };

  const addCustomApp = (app: CustomApp) => {
    const newApps = [...customApps, app];
    setCustomApps(newApps);
    saveToStorage(newApps);
  };

  const updateCustomApp = (id: string, updates: Partial<CustomApp>) => {
    const newApps = customApps.map(app => 
      app.id === id ? { ...app, ...updates } : app
    );
    setCustomApps(newApps);
    saveToStorage(newApps);
  };

  const deleteCustomApp = (id: string) => {
    const newApps = customApps.filter(app => app.id !== id);
    setCustomApps(newApps);
    saveToStorage(newApps);
  };

  const getCustomAppsByCategory = (categoryId: string, subcategoryId: string) => {
    return customApps.filter(
      app => app.categoryId === categoryId && app.subcategoryId === subcategoryId
    );
  };

  return (
    <CustomAppsContext.Provider
      value={{
        customApps,
        addCustomApp,
        updateCustomApp,
        deleteCustomApp,
        getCustomAppsByCategory,
      }}
    >
      {children}
    </CustomAppsContext.Provider>
  );
};

export const useCustomApps = () => {
  const context = React.useContext(CustomAppsContext);
  if (!context) {
    throw new Error('useCustomApps must be used within CustomAppsProvider');
  }
  return context;
};

