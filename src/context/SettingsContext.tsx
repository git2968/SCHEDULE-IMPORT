import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, SettingsContextType } from '../types';
import { calculateCurrentWeek, getTodayString } from '../utils/dateUtils';

// 获取正确的资源基础路径
const getBasePath = (): string => {
  if (typeof window !== 'undefined') {
    // 检测部署环境
    if (window.location.hostname.includes('github.io') && window.location.pathname.includes('SCHEDULE-IMPORT')) {
      // GitHub Pages环境
      return '/SCHEDULE-IMPORT/';
    } else if (window.location.hostname.includes('vercel.app')) {
      // Vercel环境
      return '/';
    }
  }
  // 默认使用相对路径
  return './';
};

// 确保背景图片路径正确
const getBackgroundPath = (): string => {
  // 检查是否在 Vercel 环境
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    // Vercel环境，使用绝对路径
    return '/backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
  } else if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    // GitHub Pages环境
    return '/SCHEDULE-IMPORT/backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
  }
  // 开发环境，使用相对路径
  return './backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
};

// 默认设置
const defaultSettings: AppSettings = {
  backgroundImage: getBackgroundPath(), // 默认背景图片路径
  theme: 'light',
  language: 'zh',
  currentWeek: 1,
  semesterStartDate: getTodayString(), // 默认为今天
  autoUpdateWeek: true
};

// 创建设置上下文
export const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // 初始化时加载用户设置
  useEffect(() => {
    // 获取当前用户信息
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    if (currentUser) {
      // 如果用户已登录，加载用户特定的设置
      const userSettingsKey = `userSettings_${currentUser.id}`;
      const storedUserSettings = localStorage.getItem(userSettingsKey);
      
      if (storedUserSettings) {
        try {
          const parsedSettings = JSON.parse(storedUserSettings);
          setSettings({
            ...defaultSettings,
            ...parsedSettings
          });
        } catch (error) {
          console.error('Failed to parse user settings', error);
        }
      }
    } else {
      // 如果用户未登录，加载默认设置或全局设置
      const globalSettings = localStorage.getItem('globalSettings');
      if (globalSettings) {
        try {
          const parsedSettings = JSON.parse(globalSettings);
          setSettings({
            ...defaultSettings,
            ...parsedSettings
          });
        } catch (error) {
          console.error('Failed to parse global settings', error);
        }
      }
    }
  }, []);

  // 更新设置并保存到本地存储
  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    // 更新内存中的设置
    const updatedSettings = {
      ...settings,
      ...newSettings
    };
    
    setSettings(updatedSettings);
    
    // 获取当前用户信息
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    if (currentUser) {
      // 如果用户已登录，保存到用户特定的设置
      const userSettingsKey = `userSettings_${currentUser.id}`;
      localStorage.setItem(userSettingsKey, JSON.stringify(updatedSettings));
    } else {
      // 否则保存到全局设置
      localStorage.setItem('globalSettings', JSON.stringify(updatedSettings));
    }
    
    return Promise.resolve();
  };

  // 上传背景图片
  const uploadBackgroundImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            // 直接使用 base64 数据 URL
            const imageDataUrl = event.target.result.toString();
            
            // 更新设置
            updateSettings({ backgroundImage: imageDataUrl })
              .then(() => resolve(imageDataUrl))
              .catch(reject);
          } else {
            reject(new Error('Failed to read image file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // 获取当前周数
  const getCurrentWeek = (): number => {
    if (!settings) return 1;
    
    if (settings.autoUpdateWeek && settings.semesterStartDate) {
      return calculateCurrentWeek(settings.semesterStartDate);
    }
    
    return settings.currentWeek || 1;
  };

  // 更新当前周数（根据当前日期和学期开始日期自动计算）
  const updateCurrentWeek = () => {
    if (!settings || !settings.autoUpdateWeek || !settings.semesterStartDate) {
      return;
    }
    
    const calculatedWeek = calculateCurrentWeek(settings.semesterStartDate);
    if (calculatedWeek !== settings.currentWeek) {
      updateSettings({ currentWeek: calculatedWeek });
    }
  };

  // 定期更新当前周数（每小时检查一次）
  useEffect(() => {
    if (settings?.autoUpdateWeek) {
      updateCurrentWeek();
      
      const interval = setInterval(() => {
        updateCurrentWeek();
      }, 3600000); // 1小时 = 3600000毫秒
      
      return () => clearInterval(interval);
    }
  }, [settings?.autoUpdateWeek, settings?.semesterStartDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    settings,
    updateSettings,
    uploadBackgroundImage,
    getCurrentWeek,
    updateCurrentWeek
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// 确保导出兼容HMR
SettingsProvider.displayName = 'SettingsProvider'; 