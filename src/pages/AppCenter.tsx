/**
 * 应用中心页面 - 全新设计
 * 
 * 三级分类展示：
 * 1. 一级分类：学习、娱乐、工具、生活等大类
 * 2. 二级分类：每个大类下的细分类别
 * 3. 三级应用：具体的应用详情
 */

import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { APP_DATA, AppCategory, AppSubcategory, App } from '../types/apps';
import AnimatedList from '../components/animations/AnimatedList';
import Icon from '../components/Icon';
import { useCustomApps } from '../hooks/useCustomApps';
import { useCustomCategories } from '../context/CustomCategoriesContext';
import AddAppDialog from '../components/AddAppDialog';
import AppCenterBackgroundSettings from '../components/AppCenterBackgroundSettings';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ContentWrapper = styled.div`
  padding: 2rem 2.5rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.25rem;
    gap: 1.25rem;
  }
`;

/** 面包屑导航 */
const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 252, 255, 0.9));
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1.5px solid rgba(10, 132, 255, 0.12);
  box-shadow: 0 3px 12px rgba(10, 132, 255, 0.05), 0 1px 4px rgba(0, 0, 0, 0.02);
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    border-radius: 10px;
  }
`;

const BreadcrumbItem = styled.span<{ clickable?: boolean }>`
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  color: ${props => props.clickable ? 'rgba(10, 132, 255, 0.9)' : 'rgba(0, 0, 0, 0.75)'};
  font-weight: ${props => props.clickable ? '600' : '600'};
  font-size: 1.05rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: ${props => props.clickable ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 0, 0, 0.75)'};
    transform: ${props => props.clickable ? 'translateX(-2px)' : 'none'};
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: rgba(10, 132, 255, 0.3);
  font-size: 1.2rem;
`;

const SearchContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.9rem 1.25rem 0.9rem 3rem;
  font-size: 0.95rem;
  border: 1.5px solid rgba(10, 132, 255, 0.15);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 252, 255, 0.9));
  backdrop-filter: blur(20px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 3px 12px rgba(10, 132, 255, 0.05), 0 1px 4px rgba(0, 0, 0, 0.02);
  
  &:focus {
    outline: none;
    border-color: rgba(10, 132, 255, 0.4);
    box-shadow: 0 5px 16px rgba(10, 132, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.125rem 0.8rem 2.875rem;
    font-size: 0.925rem;
    border-radius: 10px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(10, 132, 255, 0.6);
  pointer-events: none;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    left: 1rem;
    font-size: 1rem;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 252, 255, 0.9));
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(10, 132, 255, 0.2);
  border-radius: 12px;
  color: rgba(10, 132, 255, 0.9);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.08);
  margin-bottom: 1.5rem;
  flex-shrink: 0;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 252, 255, 0.95));
    border-color: rgba(10, 132, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(10, 132, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/** 一级分类网格 */
const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

/** 一级分类卡片 */
const CategoryCard = styled.div<{ gradient: string }>`
  background: ${props => props.gradient};
  border-radius: 18px;
  padding: 2rem 1.75rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 220px;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: scale(0);
    transition: transform 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 32px rgba(0, 0, 0, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    
    &:before {
      opacity: 1;
    }
    
    &:after {
      transform: scale(1);
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 1.75rem 1.5rem;
    border-radius: 16px;
    min-height: 200px;
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.12));
  position: relative;
  z-index: 1;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @media (max-width: 768px) {
    font-size: 2.75rem;
    margin-bottom: 0.875rem;
  }
`;

const CategoryName = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.625rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  letter-spacing: 0.4px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const CategoryCount = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

/** 二级分类列表 */
const SubcategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SubcategoryCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid rgba(10, 132, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(10, 132, 255, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 0;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    transition: height 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: rgba(10, 132, 255, 0.25);
    box-shadow: 
      0 8px 24px rgba(10, 132, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    
    &:before {
      height: 100%;
    }
  }
  
  &:active {
    transform: translateY(-3px) scale(1.01);
  }
`;

const SubcategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SubcategoryIcon = styled.div`
  font-size: 2rem;
  color: rgba(10, 132, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(64, 210, 255, 0.05));
  border-radius: 12px;
  border: 1.5px solid rgba(10, 132, 255, 0.15);
`;

const SubcategoryName = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const SubcategoryAppCount = styled.p`
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  font-weight: 500;
`;

/** 三级应用网格 */
const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const AppCard = styled.div<{ color: string }>`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid rgba(10, 132, 255, 0.1);
  box-shadow: 
    0 4px 16px rgba(10, 132, 255, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0A84FF, #64D2FF);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.03);
    border-color: rgba(10, 132, 255, 0.25);
    box-shadow: 
      0 12px 32px rgba(10, 132, 255, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    
    &:before {
      transform: scaleX(1);
    }
  }
  
  &:active {
    transform: translateY(-6px) scale(1.02);
  }
`;

const AppIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.08));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  border: 1.5px solid rgba(10, 132, 255, 0.2);
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.08);
`;

const AppName = styled.h5`
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.75rem 0;
`;

const AppDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.03), rgba(64, 210, 255, 0.02));
  border-radius: 20px;
  border: 2px dashed rgba(10, 132, 255, 0.2);
  
  .icon {
    font-size: 5rem;
    margin-bottom: 2rem;
    opacity: 0.5;
    animation: float 3s ease-in-out infinite;
  }
  
  h3 {
    font-size: 1.5rem;
    color: rgba(0, 0, 0, 0.7);
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.5);
  }
`;

/** 浮动新增按钮 */
const FloatingAddButton = styled.button`
  position: fixed;
  bottom: 4rem;
  right: 3rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  border: none;
  box-shadow: 0 8px 24px rgba(10, 132, 255, 0.4), 0 16px 48px rgba(10, 132, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  
  &:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 12px 32px rgba(10, 132, 255, 0.5), 0 20px 60px rgba(10, 132, 255, 0.3);
  }
  
  &:active {
    transform: scale(1.05) rotate(90deg);
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    bottom: 3rem;
    right: 2rem;
  }
`;

/** 自定义应用卡片 - 带删除按钮 */
const CustomAppCardWrapper = styled.div`
  position: relative;
  
  &:hover .app-actions {
    opacity: 1;
  }
`;

const AppActionsDiv = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 59, 48, 0.95);
    color: white;
    transform: scale(1.1);
  }
`;

const FloatingSettingsButton = styled.button`
  position: fixed;
  width: 64px;
  height: 64px;
  bottom: 4rem;
  right: 9rem; /* 在添加按钮左侧，间距约为2rem */
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.95), rgba(165, 142, 251, 0.9));
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(108, 99, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  
  &:hover {
    background: linear-gradient(135deg, rgba(108, 99, 255, 1), rgba(165, 142, 251, 1));
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 8px 32px rgba(108, 99, 255, 0.4);
  }
  
  &:active {
    transform: scale(1.05) rotate(90deg);
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    bottom: 3rem;
    right: 7.5rem; /* 在添加按钮左侧，间距约为1.5rem */
    font-size: 1.75rem;
  }
`;

const AppCenter: React.FC = () => {
  const navigate = useNavigate();
  const { customApps, addCustomApp, deleteCustomApp, getCustomAppsByCategory } = useCustomApps();
  const { customCategories, addCategory, addSubcategory } = useCustomCategories();
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<AppSubcategory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 合并预设分类和自定义分类
  const allCategories = useMemo(() => {
    return [...APP_DATA, ...customCategories];
  }, [customCategories]);

  // 根据搜索过滤分类
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    
    const query = searchQuery.toLowerCase().trim();
    return allCategories.filter(category => {
      // 检查分类名称
      if (category.name.toLowerCase().includes(query)) return true;
      
      // 检查子分类名称和应用
      return category.subcategories.some(sub => {
        if (sub.name.toLowerCase().includes(query)) return true;
        
        // 检查预设应用
        if (sub.apps.some(app => 
          app.name.toLowerCase().includes(query) ||
          (app.description && app.description.toLowerCase().includes(query))
        )) return true;
        
        // 检查自定义应用
        const customAppsInSub = getCustomAppsByCategory(category.id, sub.id);
        return customAppsInSub.some(app => 
          app.name.toLowerCase().includes(query) ||
          (app.description && app.description.toLowerCase().includes(query))
        );
      });
    });
  }, [allCategories, searchQuery, getCustomAppsByCategory]);

  const handleCategoryClick = (category: AppCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory: AppSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleAppClick = (app: App, isExternal = false) => {
    if (isExternal) {
      window.open(app.path, '_blank');
    } else {
      navigate(app.path);
    }
  };

  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // 计算应用总数（包含自定义应用）
  const getAppCount = useCallback((category: AppCategory): number => {
    let count = 0;
    category.subcategories.forEach(sub => {
      count += sub.apps.length;
      count += getCustomAppsByCategory(category.id, sub.id).length;
    });
    return count;
  }, [getCustomAppsByCategory]);

  // 处理添加分类
  const handleAddCategory = (name: string, icon: string) => {
    addCategory(name, icon);
    toast.success('分类添加成功！');
  };

  // 处理添加子分类
  const handleAddSubcategory = (categoryId: string, name: string, icon: string) => {
    addSubcategory(categoryId, name, icon);
    toast.success('子分类添加成功！');
  };

  // 合并预设应用和自定义应用
  const getMergedApps = useCallback((subcategory: AppSubcategory, categoryId?: string) => {
    const catId = categoryId || selectedCategory?.id;
    if (!catId) return subcategory.apps;
    
    const customAppsForSubcategory = getCustomAppsByCategory(
      catId,
      subcategory.id
    );
    
    // 转换自定义应用为App类型
    const convertedCustomApps: App[] = customAppsForSubcategory.map(customApp => ({
      ...customApp,
      category: customApp.categoryId,
      subcategory: customApp.subcategoryId,
    }));
    
    return [...subcategory.apps, ...convertedCustomApps];
  }, [selectedCategory, getCustomAppsByCategory]);

  // 处理新增应用
  const handleAddApp = (appData: {
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    icon: string;
    iconType: 'lineicon' | 'upload';
    iconUrl?: string;
    path: string;
    isExternal: boolean;
  }) => {
    const newApp = {
      id: `custom-${Date.now()}`,
      ...appData,
      color: 'rgba(10, 132, 255, 0.15)',
    };
    
    addCustomApp(newApp);
    setIsAddDialogOpen(false);
    toast.success('应用添加成功！');
  };

  // 处理删除自定义应用
  const handleDeleteApp = (appId: string, appName: string) => {
    if (window.confirm(`确定要删除"${appName}"吗？`)) {
      deleteCustomApp(appId);
      toast.success('应用已删除');
    }
  };

  // 渲染应用卡片（支持自定义应用的删除功能）
  const renderAppCard = (app: App, isCustom: boolean) => {
    const customApp = isCustom ? customApps.find(ca => ca.id === app.id) : null;
    const iconElement = customApp?.iconType === 'upload' && customApp?.iconUrl ? (
      <img src={customApp.iconUrl} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    ) : (
      <Icon name={app.icon} size="32" />
    );

    const cardContent = (
      <>
        <AppIconWrapper>{iconElement}</AppIconWrapper>
        <AppName>{app.name}</AppName>
        <AppDescription>{app.description}</AppDescription>
      </>
    );

    if (isCustom) {
      return (
        <CustomAppCardWrapper key={app.id}>
          <AppCard
            color={app.color}
            onClick={() => handleAppClick(app, customApp?.isExternal)}
          >
            {cardContent}
          </AppCard>
          <AppActionsDiv className="app-actions">
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteApp(app.id, app.name);
              }}
            >
              <Icon name="trash-3" size="sm" />
            </ActionButton>
          </AppActionsDiv>
        </CustomAppCardWrapper>
      );
    }

    return (
      <AppCard
        key={app.id}
        color={app.color}
        onClick={() => handleAppClick(app, false)}
      >
        {cardContent}
      </AppCard>
    );
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* 面包屑导航 */}
        <Breadcrumb>
          <BreadcrumbItem 
            clickable={!!(selectedCategory || selectedSubcategory)}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
          >
            <Icon name="home-2" size="sm" />
            应用中心
          </BreadcrumbItem>
          {selectedCategory && (
            <>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbItem 
                clickable={!!selectedSubcategory}
                onClick={() => setSelectedSubcategory(null)}
              >
                <Icon name={selectedCategory.icon} size="sm" />
                {selectedCategory.name}
              </BreadcrumbItem>
            </>
          )}
          {selectedSubcategory && (
            <>
              <BreadcrumbSeparator>›</BreadcrumbSeparator>
              <BreadcrumbItem>
                <Icon name={selectedSubcategory.icon} size="sm" />
                {selectedSubcategory.name}
              </BreadcrumbItem>
            </>
          )}
        </Breadcrumb>

        {/* 搜索框 - 只在首页显示 */}
        {!selectedCategory && !selectedSubcategory && (
          <SearchContainer>
            <SearchIcon>
              <Icon name="search-1" size="lg" />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="搜索应用、分类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
        )}

        {/* 返回按钮 */}
        {(selectedCategory || selectedSubcategory) && (
          <BackButton onClick={handleBack}>
            <Icon name="arrow-left" />
            返回
          </BackButton>
        )}

        {/* 三级应用列表 */}
        {selectedSubcategory ? (
          (() => {
            const mergedApps = getMergedApps(selectedSubcategory);
            return mergedApps.length > 0 ? (
              <AnimatedList>
                <AppGrid>
                  {mergedApps.map(app => {
                    const isCustom = app.id.startsWith('custom-');
                    return renderAppCard(app, isCustom);
                  })}
                </AppGrid>
              </AnimatedList>
            ) : (
              <EmptyState>
                <div className="icon">
                  <Icon name="box-closed" size="32" />
                </div>
                <h3>暂无应用</h3>
                <p>该分类下还没有应用，点击右下角的"+"按钮添加</p>
              </EmptyState>
            );
          })()
        ) : selectedCategory ? (
          // 二级分类列表
          <AnimatedList>
            <SubcategoryList>
              {selectedCategory.subcategories.map(subcategory => {
                const totalApps = getMergedApps(subcategory).length;
                return (
                  <SubcategoryCard 
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <SubcategoryHeader>
                      <SubcategoryIcon>
                        <Icon name={subcategory.icon} size="lg" />
                      </SubcategoryIcon>
                      <div>
                        <SubcategoryName>{subcategory.name}</SubcategoryName>
                        <SubcategoryAppCount>
                          {totalApps} 个应用
                        </SubcategoryAppCount>
                      </div>
                    </SubcategoryHeader>
                  </SubcategoryCard>
                );
              })}
            </SubcategoryList>
          </AnimatedList>
        ) : (
          // 一级分类列表
          <AnimatedList>
            {filteredCategories.length > 0 ? (
              <CategoryGrid>
                {filteredCategories.map((category) => (
                  <CategoryCard 
                    key={category.id}
                    gradient={category.color}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div>
                      <CategoryIcon>
                        <Icon name={category.icon} size="32" />
                      </CategoryIcon>
                      <CategoryName>{category.name}</CategoryName>
                      <CategoryCount>{getAppCount(category)} 个应用</CategoryCount>
                    </div>
                  </CategoryCard>
                ))}
              </CategoryGrid>
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
                <Icon name="search-1" size="32" />
                <p style={{ marginTop: '1rem' }}>未找到匹配的分类或应用</p>
              </div>
            )}
          </AnimatedList>
        )}
      </ContentWrapper>

      {/* 浮动按钮组 */}
      <FloatingSettingsButton onClick={() => setIsSettingsOpen(true)}>
        <Icon name="gear-1" />
      </FloatingSettingsButton>
      
      <FloatingAddButton onClick={() => setIsAddDialogOpen(true)}>
        <Icon name="plus" />
      </FloatingAddButton>

      {/* 背景设置对话框 */}
      <AppCenterBackgroundSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 添加应用对话框 */}
      <AddAppDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddApp}
        onAddCategory={handleAddCategory}
        onAddSubcategory={handleAddSubcategory}
        allCategories={allCategories}
      />
    </PageContainer>
  );
};

export default AppCenter;
