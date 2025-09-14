import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, SettingsContextType } from '../types';

// 默认设置
const defaultSettings: AppSettings = {
  backgroundImage: '/backImg/f028b1e9685c586324a8f2a6626e3695.jpeg', // 默认背景图片路径
  theme: 'light',
  language: 'zh'
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

  const value = {
    settings,
    updateSettings,
    uploadBackgroundImage
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 