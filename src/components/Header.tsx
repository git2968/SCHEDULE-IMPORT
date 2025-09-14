import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import GlassButton from './GlassButton';

// 定义淡出动画
const fadeOut = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const HeaderContainer = styled.header`
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-text);
  text-decoration: none;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: var(--dark-text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

// 页面过渡淡出层
const LogoutOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${fadeOut} 0.8s ease-in forwards;
`;

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      // 开始登出过渡动画
      setIsLoggingOut(true);
      
      // 执行过渡动画，然后登出
      await logout(async () => {
        // 等待动画完成的Promise
        await new Promise<void>(resolve => {
          toast.success('退出登录成功');
          setTimeout(() => {
            resolve();
          }, 800); // 与动画持续时间匹配
        });
      });
      
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };
  
  return (
    <>
      {/* 登出过渡层 */}
      {isLoggingOut && <LogoutOverlay />}
      
      <HeaderContainer>
        <Logo to="/">YUEの课表</Logo>
        
        <Nav>
          <NavLink to="/">导入课表</NavLink>
          {currentUser && (
            <>
              <NavLink to="/schedules">我的课表</NavLink>
              <NavLink to="/dashboard">当前课表</NavLink>
              <NavLink to="/courses">课程管理</NavLink>
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