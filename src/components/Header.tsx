import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GlassButton from './GlassButton';

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

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  return (
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
          <GlassButton onClick={handleLogout} variant="secondary">
            退出登录
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
  );
};

export default Header; 