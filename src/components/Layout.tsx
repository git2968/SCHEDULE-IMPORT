import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useSettings } from '../hooks/useSettings';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

// 简洁的背景容器
const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

// 背景图片 - 使用简单的交叉淡入淡出效果
const BackgroundImage = styled.div<{ $url: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$url});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transition: opacity 1s ease;
  opacity: 1;
`;

const Main = styled.main`
  flex: 1;
  padding: 0 1rem;
  padding-bottom: 80px;  /* 为固定的Footer留出空间 */
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
    padding-bottom: 70px;  /* 移动端Footer较小 */
  }
  
  @media (min-width: 1200px) {
    padding: 0 2rem;
    padding-bottom: 80px;  /* 为固定的Footer留出空间 */
  }
`;

const Layout: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  
  // 获取默认背景图片路径
  const getDefaultBackgroundPath = (): string => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('github.io') && 
          window.location.pathname.includes('SCHEDULE-IMPORT')) {
        return '/SCHEDULE-IMPORT/backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
      } else if (window.location.hostname.includes('vercel.app')) {
        return '/backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
      }
    }
    return './backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
  };

  // 判断是否在应用中心页面
  const isAppCenterPage = location.pathname.startsWith('/app-center');

  // 当背景图片改变时更新
  useEffect(() => {
    // 根据当前页面选择对应的背景图片
    const currentBg = isAppCenterPage 
      ? (settings?.appCenterBackgroundImage || getDefaultBackgroundPath())
      : (settings?.backgroundImage || getDefaultBackgroundPath());
    
    // 如果是第一次加载或背景图片相同，直接设置
    if (backgroundImages.length === 0 || backgroundImages[0] === currentBg) {
      setBackgroundImages([currentBg]);
      return;
    }
    
    // 添加新背景，保持旧背景在下方
    setBackgroundImages(prev => [currentBg, ...prev]);
    
    // 一段时间后移除旧背景
    const timer = setTimeout(() => {
      setBackgroundImages(prev => [prev[0]]);
    }, 1000); // 等待过渡完成
    
    return () => clearTimeout(timer);
  }, [settings?.backgroundImage, settings?.appCenterBackgroundImage, isAppCenterPage]);

  return (
    <LayoutContainer>
      <BackgroundContainer>
        {backgroundImages.map((url, index) => (
          <BackgroundImage
            key={`${url}-${index}`}
            $url={url}
            style={{
              opacity: index === 0 ? 1 : 0, // 只显示最顶层背景
              zIndex: backgroundImages.length - index // 确保层叠顺序正确
            }}
          />
        ))}
      </BackgroundContainer>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout; 