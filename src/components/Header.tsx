import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import GlassButton from './GlassButton';
import Icon from './Icon';

// 简单的淡入淡出效果
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const HeaderContainer = styled.header`
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: opacity 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-text);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    order: 1;
    flex: 0 0 auto;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
`;

const NavLink = styled(Link)`
  color: var(--dark-text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    order: 2;
    gap: 0.5rem;
    margin-left: auto;
  }
`;

// 简洁的退出遮罩
const LogoutOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${fadeIn} 0.5s ease forwards;
`;

// 转场提示
const TransitionMessage = styled.div`
  background: rgba(255, 255, 255, 0.85);
  padding: 1.5rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: ${fadeIn} 0.5s ease 0.2s both;
  
  h3 {
    margin-bottom: 0.75rem;
    color: var(--dark-text);
  }
  
  p {
    color: var(--light-text);
    margin-bottom: 0;
  }
`;

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 判断是否在课程表应用内
  const isInScheduleApp = location.pathname.startsWith('/apps/schedule');
  
  const handleLogout = async () => {
    try {
      // 显示退出遮罩
      setIsLoggingOut(true);
      
      // 成功提示
      toast.success('退出成功，页面即将刷新');
      
      // 等待动画显示，然后执行退出
      setTimeout(async () => {
        await logout();
        // 页面将会自动刷新
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('登出失败', error);
      setIsLoggingOut(false);
      toast.error('退出失败，请重试');
    }
  };
  
  return (
    <>
      {isLoggingOut && (
        <LogoutOverlay>
          <TransitionMessage>
            <h3>正在退出登录</h3>
            <p>正在为您准备默认主题...</p>
          </TransitionMessage>
        </LogoutOverlay>
      )}
      
      <HeaderContainer style={{ opacity: isLoggingOut ? 0.3 : 1 }}>
        <Logo to="/app-center"><Icon name="home" /> 应用中心</Logo>
        
        <Nav>
          {/* 只在课程表应用内显示课程表相关导航 */}
          {currentUser && isInScheduleApp && (
            <>
              <NavLink to="/apps/schedule"><Icon name="calendar" /> 课表</NavLink>
              <NavLink to="/apps/schedule/list"><Icon name="book" /> 我的课表</NavLink>
              <NavLink to="/apps/schedule/courses"><Icon name="cog" /> 课程管理</NavLink>
            </>
          )}
        </Nav>
        
        <ButtonsContainer>
          {currentUser ? (
            <GlassButton 
              onClick={handleLogout} 
              variant="secondary"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '退出中...' : '退出登录'}
            </GlassButton>
          ) : (
            <>
              <Link to="/login">
                <GlassButton variant="secondary">登录</GlassButton>
              </Link>
              <Link to="/register">
                <GlassButton>注册</GlassButton>
              </Link>
            </>
          )}
        </ButtonsContainer>
      </HeaderContainer>
    </>
  );
};

export default Header; 