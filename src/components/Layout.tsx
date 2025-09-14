import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
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

// 使用两个背景层实现平滑过渡
const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const BackgroundImage = styled.div<{ bgImage: string; isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 1.2s ease;
  opacity: ${props => props.isActive ? 1 : 0};
`;

const Main = styled.main`
  flex: 1;
  padding: 0 1rem;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (min-width: 1200px) {
    padding: 0 2rem;
  }
`;

const Layout: React.FC = () => {
  const { settings } = useSettings();
  const [currentBg, setCurrentBg] = React.useState<string>('');
  const [prevBg, setPrevBg] = React.useState<string>('');
  const [isTransitioning, setIsTransitioning] = React.useState<boolean>(false);
  
  // 获取正确的资源路径
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
  
  // 默认背景图片
  const defaultBgImage = getBackgroundPath();
  
  // 当设置中的背景图片变化时，触发平滑过渡
  React.useEffect(() => {
    const newBg = settings?.backgroundImage || defaultBgImage;
    
    if (newBg !== currentBg && currentBg) {
      // 存储当前背景作为前一个背景
      setPrevBg(currentBg);
      // 设置新的背景
      setCurrentBg(newBg);
      // 开始过渡
      setIsTransitioning(true);
      
      // 过渡结束后重置状态
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1200); // 与CSS过渡时间匹配
      
      return () => clearTimeout(timer);
    } else {
      // 初始加载时直接设置背景
      setCurrentBg(newBg);
    }
  }, [settings?.backgroundImage, defaultBgImage]);
  
  // 用于调试
  React.useEffect(() => {
    console.log('Background image:', currentBg);
    console.log('Previous background:', prevBg);
    console.log('Is transitioning:', isTransitioning);
  }, [currentBg, prevBg, isTransitioning]);

  return (
    <LayoutContainer>
      <BackgroundWrapper>
        {/* 显示前一个背景（淡出） */}
        {isTransitioning && prevBg && (
          <BackgroundImage 
            bgImage={prevBg} 
            isActive={false} 
          />
        )}
        
        {/* 显示当前背景（淡入） */}
        <BackgroundImage 
          bgImage={currentBg} 
          isActive={true} 
        />
      </BackgroundWrapper>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout; 