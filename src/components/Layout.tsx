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
      const baseUrl = window.location.pathname.includes('SCHEDULE-IMPORT') ? '/SCHEDULE-IMPORT/' : '/';
      return baseUrl;
    }
    return '/';
  };
  
  // 默认背景图片
  const defaultBgImage = `${getBasePath()}backImg/f028b1e9685c586324a8f2a6626e3695.jpeg`;
  
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