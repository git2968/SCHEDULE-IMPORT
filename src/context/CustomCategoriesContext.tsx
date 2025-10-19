/**
 * 自定义分类管理 Context
 * 支持用户添加自定义的一级分类和二级分类
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppCategory, AppSubcategory } from '../types/apps';

interface CustomCategoriesContextType {
  customCategories: AppCategory[];
  addCategory: (name: string, icon: string) => string; // 返回新分类的ID
  addSubcategory: (categoryId: string, name: string, icon: string) => string; // 返回新子分类的ID
  deleteCategory: (categoryId: string) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  getAllCategories: () => AppCategory[];
}

const CustomCategoriesContext = createContext<CustomCategoriesContextType | undefined>(undefined);

const STORAGE_KEY = 'custom_categories';

export const CustomCategoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customCategories, setCustomCategories] = useState<AppCategory[]>([]);

  // 从 localStorage 加载自定义分类
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomCategories(parsed);
      }
    } catch (error) {
      console.error('加载自定义分类失败', error);
    }
  }, []);

  // 保存到 localStorage
  const saveToStorage = (categories: AppCategory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('保存自定义分类失败', error);
    }
  };

  const addCategory = (name: string, icon: string): string => {
    const newId = `custom-cat-${Date.now()}`;
    const newCategory: AppCategory = {
      id: newId,
      name,
      icon,
      color: 'linear-gradient(135deg, #6366F1, #8B5CF6)', // 默认紫色渐变
      subcategories: [],
    };
    const newCategories = [...customCategories, newCategory];
    setCustomCategories(newCategories);
    saveToStorage(newCategories);
    return newId;
  };

  const addSubcategory = (categoryId: string, name: string, icon: string): string => {
    const newId = `custom-subcat-${Date.now()}`;
    const newSubcategory: AppSubcategory = {
      id: newId,
      name,
      icon,
      apps: [],
    };
    
    const newCategories = customCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSubcategory],
        };
      }
      return cat;
    });
    
    setCustomCategories(newCategories);
    saveToStorage(newCategories);
    return newId;
  };

  const deleteCategory = (categoryId: string) => {
    const newCategories = customCategories.filter(cat => cat.id !== categoryId);
    setCustomCategories(newCategories);
    saveToStorage(newCategories);
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const newCategories = customCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId),
        };
      }
      return cat;
    });
    
    setCustomCategories(newCategories);
    saveToStorage(newCategories);
  };

  const getAllCategories = (): AppCategory[] => {
    return customCategories;
  };

  return (
    <CustomCategoriesContext.Provider
      value={{
        customCategories,
        addCategory,
        addSubcategory,
        deleteCategory,
        deleteSubcategory,
        getAllCategories,
      }}
    >
      {children}
    </CustomCategoriesContext.Provider>
  );
};

export const useCustomCategories = () => {
  const context = React.useContext(CustomCategoriesContext);
  if (!context) {
    throw new Error('useCustomCategories must be used within CustomCategoriesProvider');
  }
  return context;
};

