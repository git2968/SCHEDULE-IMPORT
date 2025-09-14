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

const BackgroundImage = styled.div<{ bgImage: string }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  transition: background-image 0.5s ease;
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
    const base = getBasePath();
    // 如果是相对路径（./)，则不需要前导斜杠
    if (base === './') {
      return 'backImg/f028b1e9685c586324a8f2a6626e3695.jpeg';
    }
    // 否则加上基础路径
    return `${base}backImg/f028b1e9685c586324a8f2a6626e3695.jpeg`;
  };
  
  // 默认背景图片
  const defaultBgImage = getBackgroundPath();
  
  // 获取背景图片 - 现在直接使用设置中的背景图片值
  const backgroundImage = settings?.backgroundImage || defaultBgImage;
  
  // 为了调试目的，打印背景图片信息
  console.log('Background image:', backgroundImage);

  return (
    <LayoutContainer>
      <BackgroundImage bgImage={backgroundImage} />
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout; 